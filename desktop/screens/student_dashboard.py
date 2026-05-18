import os
import threading
import tkinter.filedialog as fd
import customtkinter as ctk
from core import api_client
from core.auth import Auth
from core.colors import *

F = "Segoe UI"

STATUS_COLORS = {
    "CORRECTED":   (GREEN_LIGHT, GREEN),
    "IN_PROGRESS": (BLUE_LIGHT,  BLUE),
    "PENDING":     (ORANGE_LIGHT, ORANGE),
}
SUBJECT_BG = ["#E3F2FD", "#E8F5E9", "#FFF8E1", "#FCE4EC", "#EDE7F6", "#E0F7FA"]


def _nav_bar(parent, subtitle: str, on_logout):
    """Shared top navigation bar."""
    nav = ctk.CTkFrame(parent, fg_color=DARK, corner_radius=0, height=52)
    nav.grid(row=0, column=0, sticky="ew")
    nav.grid_propagate(False)
    nav.grid_columnconfigure(1, weight=1)

    ctk.CTkLabel(nav, text="📖  CourseCorrect", font=(F, 15, "bold"), text_color=WHITE).grid(
        row=0, column=0, padx=20, pady=14)
    ctk.CTkLabel(nav, text=subtitle, font=(F, 12), text_color="#90CAF9").grid(
        row=0, column=1, padx=20, sticky="e")
    ctk.CTkButton(
        nav, text="Log Out", height=28, font=(F, 11, "bold"),
        fg_color="transparent", border_width=1, border_color="#546E7A",
        text_color="#90CAF9", hover_color=DARK, corner_radius=6,
        command=on_logout,
    ).grid(row=0, column=2, padx=(0, 16))


def _card_frame(parent, row: int, col: int = 0, colspan: int = 1, pady=(0, 10)) -> ctk.CTkFrame:
    f = ctk.CTkFrame(parent, fg_color=WHITE, corner_radius=12, border_width=1, border_color=BORDER)
    f.grid(row=row, column=col, columnspan=colspan, sticky="ew", pady=pady)
    f.grid_columnconfigure(0, weight=1)
    return f


# ══════════════════════════════════════════════════════════════════════
class StudentDashboard(ctk.CTkFrame):
    def __init__(self, parent, on_logout):
        super().__init__(parent, fg_color=BG, corner_radius=0)
        self._on_logout = on_logout
        self._assignments: list = []
        self._corrections: list = []
        self._courses: list = []
        self._subjects: list = []
        self._services: list = []
        self._file_path: str | None = None
        self._service_var = ctk.IntVar(value=0)
        self._course_var = ctk.StringVar()
        self._build()
        self._load()

    # ── Layout skeleton ──────────────────────────────────────────────
    def _build(self):
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        user = Auth.user
        name = f"{user.get('first_name','')} {user.get('last_name','')}"
        _nav_bar(self, f"👤  {name}  ·  NYU Student", self._logout)

        self._tabs = ctk.CTkTabview(
            self, fg_color=BG,
            segmented_button_fg_color=BG,
            segmented_button_selected_color=BLUE,
            segmented_button_selected_hover_color=DARK,
            segmented_button_unselected_color=BG,
            segmented_button_unselected_hover_color=BLUE_LIGHT,
        )
        self._tabs.grid(row=1, column=0, sticky="nsew")

        for name in ("Assignments", "Submit", "Browse", "Profile"):
            self._tabs.add(name)
            t = self._tabs.tab(name)
            t.grid_rowconfigure(0, weight=1)
            t.grid_columnconfigure(0, weight=1)

        self._build_assignments_tab()
        self._build_submit_tab()
        self._build_browse_tab()
        self._build_profile_tab()

    # ── Assignments tab ──────────────────────────────────────────────
    def _build_assignments_tab(self):
        tab = self._tabs.tab("Assignments")
        tab.grid_rowconfigure(1, weight=1)

        # Hero KPI bar
        hero = ctk.CTkFrame(tab, fg_color=DARK, corner_radius=12, height=96)
        hero.grid(row=0, column=0, padx=16, pady=(12, 8), sticky="ew")
        hero.grid_propagate(False)
        hero.grid_columnconfigure((0, 1, 2), weight=1)

        self._kpi_lbl = {}
        for i, (key, label, hi) in enumerate([("total", "Assignments", False),
                                               ("graded", "Graded", False),
                                               ("avg", "Avg./20", True)]):
            col = ctk.CTkFrame(hero, fg_color="transparent")
            col.grid(row=0, column=i, pady=12)
            val_lbl = ctk.CTkLabel(col, text="—", font=(F, 22, "bold"),
                                   text_color="#90CAF9" if hi else WHITE)
            val_lbl.pack()
            ctk.CTkLabel(col, text=label, font=(F, 10), text_color=MUTED).pack()
            self._kpi_lbl[key] = val_lbl

        # Scrollable list
        self._asgn_scroll = ctk.CTkScrollableFrame(tab, fg_color="transparent", corner_radius=0)
        self._asgn_scroll.grid(row=1, column=0, sticky="nsew", padx=16, pady=(0, 8))
        self._asgn_scroll.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(self._asgn_scroll, text="Loading…", font=(F, 13), text_color=MUTED).grid(
            row=0, column=0, pady=60)

    def _refresh_assignments(self):
        assignments = self._assignments
        corrections = self._corrections

        total  = len(assignments)
        graded = sum(1 for a in assignments if a.get("status") == "CORRECTED")
        grades = [c["grade"] for c in corrections if c.get("grade") is not None]
        avg    = sum(grades) / len(grades) if grades else None

        self._kpi_lbl["total"].configure(text=str(total))
        self._kpi_lbl["graded"].configure(text=str(graded))
        self._kpi_lbl["avg"].configure(text=f"{avg:.1f}" if avg else "—")

        for w in self._asgn_scroll.winfo_children():
            w.destroy()

        if not assignments:
            ctk.CTkLabel(self._asgn_scroll, text="📭  No assignments yet",
                         font=(F, 14, "bold"), text_color=MUTED).grid(row=0, column=0, pady=60)
            return

        corr_map = {c["assignment"]["id"]: c for c in corrections}

        for i, a in enumerate(assignments):
            status = a.get("status", "")
            bg, fg = STATUS_COLORS.get(status, (BORDER, MUTED))
            correction = corr_map.get(a["id"])
            grade      = correction["grade"] if correction else None
            subject    = a.get("course", {}).get("subject", {})
            icon       = subject.get("icon", "📚")
            code       = subject.get("code", "")
            date       = (a.get("submitted_at") or "")[:10] or "—"
            premium    = "⭐ Premium" if a.get("service", {}).get("is_premium") else "Standard"

            card = ctk.CTkFrame(self._asgn_scroll, fg_color=WHITE, corner_radius=12,
                                border_width=1, border_color=BORDER)
            card.grid(row=i, column=0, sticky="ew", pady=(0, 8))
            card.grid_columnconfigure(2, weight=1)

            # Colored left bar
            ctk.CTkFrame(card, fg_color=fg, corner_radius=6, width=4).grid(
                row=0, column=0, sticky="ns", padx=(0, 0), pady=0)

            ctk.CTkLabel(card, text=icon, font=(F, 24)).grid(row=0, column=1, padx=(10, 4), pady=16)

            info = ctk.CTkFrame(card, fg_color="transparent")
            info.grid(row=0, column=2, sticky="ew", padx=4, pady=14)
            info.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(info, text=code, font=(F, 13, "bold"), text_color=TEXT).grid(row=0, column=0, sticky="w")
            ctk.CTkLabel(info, text=f"{date}  ·  {premium}", font=(F, 10), text_color=SUB).grid(
                row=1, column=0, sticky="w")

            badges = ctk.CTkFrame(info, fg_color="transparent")
            badges.grid(row=2, column=0, sticky="w", pady=(6, 0))
            ctk.CTkLabel(badges, text=f"  {status}  ", font=(F, 9, "bold"),
                         text_color=fg, fg_color=bg, corner_radius=6).pack(side="left")
            if grade is not None:
                gc = GREEN if grade >= 16 else BLUE if grade >= 12 else ORANGE
                ctk.CTkLabel(badges, text=f"  {grade}/20", font=(F, 13, "bold"), text_color=gc).pack(
                    side="left", padx=(8, 0))

            ctk.CTkLabel(card, text="›", font=(F, 20), text_color=MUTED).grid(row=0, column=3, padx=16)

    # ── Submit tab ───────────────────────────────────────────────────
    def _build_submit_tab(self):
        tab = self._tabs.tab("Submit")
        self._submit_scroll = ctk.CTkScrollableFrame(tab, fg_color="transparent")
        self._submit_scroll.grid(row=0, column=0, sticky="nsew", padx=16, pady=8)
        self._submit_scroll.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(self._submit_scroll, text="Loading…", font=(F, 13), text_color=MUTED).grid(
            row=0, column=0, pady=60)

    def _build_submit_form(self):
        sc = self._submit_scroll
        for w in sc.winfo_children():
            w.destroy()

        r = 0
        self._submit_err = ctk.CTkLabel(sc, text="", font=(F, 12), text_color=RED, wraplength=500)
        self._submit_err.grid(row=r, column=0, sticky="w", pady=(4, 0))
        r += 1

        # 1. Course
        ctk.CTkLabel(sc, text="1.  Select Course", font=(F, 12, "bold"), text_color=SUB).grid(
            row=r, column=0, sticky="w", pady=(16, 6))
        r += 1
        options = [
            f"{c.get('subject',{}).get('icon','📚')}  {c.get('subject',{}).get('code','')} — {c.get('semester','')}"
            for c in self._courses
        ]
        if not options:
            options = ["No courses available"]
        self._course_var.set(options[0])
        ctk.CTkOptionMenu(
            sc, variable=self._course_var, values=options,
            fg_color=WHITE, button_color=BLUE, button_hover_color=DARK,
            text_color=TEXT, font=(F, 12), corner_radius=8,
            dropdown_fg_color=WHITE, dropdown_text_color=TEXT, dropdown_hover_color=BLUE_LIGHT,
        ).grid(row=r, column=0, sticky="ew")
        r += 1

        # 2. File
        ctk.CTkLabel(sc, text="2.  Upload File", font=(F, 12, "bold"), text_color=SUB).grid(
            row=r, column=0, sticky="w", pady=(16, 6))
        r += 1
        self._file_frame = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=12,
                                        border_width=2, border_color=BLUE, height=88)
        self._file_frame.grid(row=r, column=0, sticky="ew")
        self._file_frame.grid_propagate(False)
        self._file_frame.grid_columnconfigure(0, weight=1)
        self._file_lbl = ctk.CTkLabel(
            self._file_frame, text="📎  Click to select a file   (PDF, DOC, DOCX)",
            font=(F, 12), text_color=MUTED,
        )
        self._file_lbl.grid(row=0, column=0, pady=28)
        self._file_frame.bind("<Button-1>", lambda _e: self._pick_file())
        self._file_lbl.bind("<Button-1>", lambda _e: self._pick_file())
        r += 1

        # 3. Service
        ctk.CTkLabel(sc, text="3.  Correction Type", font=(F, 12, "bold"), text_color=SUB).grid(
            row=r, column=0, sticky="w", pady=(16, 6))
        r += 1
        if self._services:
            self._service_var.set(self._services[0]["id"])
        for s in self._services:
            scard = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=10, border_width=1, border_color=BORDER)
            scard.grid(row=r, column=0, sticky="ew", pady=(0, 6))
            scard.grid_columnconfigure(1, weight=1)
            r += 1
            ctk.CTkRadioButton(scard, text="", variable=self._service_var, value=s["id"],
                               fg_color=BLUE, hover_color=DARK).grid(row=0, column=0, padx=14, pady=14)
            icon = "⭐" if s.get("is_premium") else "📝"
            ctk.CTkLabel(scard, text=f"{icon}  {s['name']}", font=(F, 13, "bold"), text_color=TEXT).grid(
                row=0, column=1, sticky="w")
            ctk.CTkLabel(scard, text=f"{s.get('turnaround_hours')}h turnaround",
                         font=(F, 10), text_color=SUB).grid(row=1, column=1, sticky="w", pady=(0, 14))
            ctk.CTkLabel(scard, text=f"${s['price']}", font=(F, 16, "bold"), text_color=BLUE).grid(
                row=0, column=2, rowspan=2, padx=16)

        self._submit_btn = ctk.CTkButton(
            sc, text="✅  Confirm Submission", height=48, font=(F, 14, "bold"),
            fg_color=GREEN, hover_color="#1B5E20", corner_radius=10, command=self._do_submit,
        )
        self._submit_btn.grid(row=r, column=0, sticky="ew", pady=(16, 4))
        r += 1
        ctk.CTkLabel(sc, text="🔒  Secure  ·  Cancel before grading starts",
                     font=(F, 10), text_color=MUTED).grid(row=r, column=0, pady=(0, 32))

    def _pick_file(self):
        path = fd.askopenfilename(filetypes=[("Documents", "*.pdf *.doc *.docx"), ("All files", "*.*")])
        if path:
            self._file_path = path
            self._file_lbl.configure(text=f"✅  {os.path.basename(path)}", text_color=GREEN)
            self._file_frame.configure(border_color=GREEN)

    def _do_submit(self):
        if not self._file_path:
            self._submit_err.configure(text="Please select a file.")
            return
        sel = self._course_var.get()
        course = next(
            (c for c in self._courses
             if c.get("subject", {}).get("code", "") in sel),
            None,
        )
        if not course:
            self._submit_err.configure(text="Please select a valid course.")
            return
        self._submit_err.configure(text="")
        self._submit_btn.configure(state="disabled", text="Submitting…")
        threading.Thread(
            target=self._bg_submit,
            args=(course["id"], self._service_var.get()),
            daemon=True,
        ).start()

    def _bg_submit(self, course_id, service_id):
        try:
            api_client.submit_assignment(Auth.token, course_id, service_id, self._file_path)
            self.after(0, self._submit_success)
        except Exception as e:
            self.after(0, lambda: self._submit_fail(str(e)))

    def _submit_success(self):
        sc = self._submit_scroll
        for w in sc.winfo_children():
            w.destroy()
        ctk.CTkLabel(sc, text="✅", font=(F, 64)).grid(row=0, column=0, pady=(60, 12))
        ctk.CTkLabel(sc, text="Assignment Submitted!", font=(F, 22, "bold"), text_color=GREEN).grid(row=1, column=0)
        ctk.CTkLabel(sc, text="Your tutor will review it shortly.",
                     font=(F, 13), text_color=SUB).grid(row=2, column=0, pady=(4, 32))
        ctk.CTkButton(
            sc, text="Back to Assignments", font=(F, 13, "bold"),
            fg_color=BLUE, hover_color=DARK, corner_radius=10, height=44,
            command=lambda: self._tabs.set("Assignments"),
        ).grid(row=3, column=0, padx=100, sticky="ew")

    def _submit_fail(self, msg):
        self._submit_err.configure(text=f"Error: {msg}")
        self._submit_btn.configure(state="normal", text="✅  Confirm Submission")

    # ── Browse tab ───────────────────────────────────────────────────
    def _build_browse_tab(self):
        tab = self._tabs.tab("Browse")
        self._browse_scroll = ctk.CTkScrollableFrame(tab, fg_color="transparent")
        self._browse_scroll.grid(row=0, column=0, sticky="nsew", padx=16, pady=8)
        for col in range(3):
            self._browse_scroll.grid_columnconfigure(col, weight=1)
        ctk.CTkLabel(self._browse_scroll, text="Loading subjects…", font=(F, 13), text_color=MUTED).grid(
            row=0, column=0, pady=60)

    def _refresh_browse(self):
        sc = self._browse_scroll
        for w in sc.winfo_children():
            w.destroy()
        for col in range(3):
            sc.grid_columnconfigure(col, weight=1)

        ctk.CTkLabel(sc, text="Choose a Subject", font=(F, 16, "bold"), text_color=TEXT).grid(
            row=0, column=0, columnspan=3, sticky="w", pady=(8, 2))
        ctk.CTkLabel(sc, text="Browse courses by department", font=(F, 12), text_color=SUB).grid(
            row=1, column=0, columnspan=3, sticky="w", pady=(0, 14))

        for i, s in enumerate(self._subjects):
            row, col = divmod(i, 3)
            bg = SUBJECT_BG[i % len(SUBJECT_BG)]

            card = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=14,
                                border_width=1, border_color=BORDER, cursor="hand2")
            card.grid(row=row + 2, column=col, padx=4, pady=4, sticky="nsew")
            card.grid_columnconfigure(0, weight=1)

            icon_box = ctk.CTkFrame(card, fg_color=bg, corner_radius=30, width=56, height=56)
            icon_box.grid(row=0, column=0, pady=(16, 8))
            icon_box.grid_propagate(False)
            ctk.CTkLabel(icon_box, text=s.get("icon", "📚"), font=(F, 26)).place(
                relx=0.5, rely=0.5, anchor="center")

            ctk.CTkLabel(card, text=s["name"], font=(F, 12, "bold"), text_color=TEXT,
                         wraplength=140, justify="center").grid(row=1, column=0, padx=8)
            ctk.CTkLabel(card, text=s.get("code", ""), font=(F, 10), text_color=MUTED).grid(
                row=2, column=0, pady=(2, 14))

            for widget in [card, icon_box] + card.winfo_children():
                widget.bind("<Button-1>", lambda _e, subj=s: self._show_courses(subj))

    def _show_courses(self, subject):
        sc = self._browse_scroll
        for w in sc.winfo_children():
            w.destroy()
        for col in range(3):
            sc.grid_columnconfigure(col, weight=1)

        ctk.CTkButton(
            sc, text="← Back to Subjects", width=140, height=30, font=(F, 11),
            fg_color="transparent", border_width=1, border_color=BORDER,
            text_color=SUB, hover_color=BLUE_LIGHT, corner_radius=8,
            command=self._refresh_browse,
        ).grid(row=0, column=0, columnspan=3, sticky="w", pady=(4, 14))

        ctk.CTkLabel(
            sc, text=f"{subject.get('icon','')}  {subject['name']}",
            font=(F, 16, "bold"), text_color=TEXT,
        ).grid(row=1, column=0, columnspan=3, sticky="w", pady=(0, 12))

        filtered = [c for c in self._courses if c.get("subject", {}).get("id") == subject["id"]]
        if not filtered:
            ctk.CTkLabel(sc, text="No courses for this subject.", font=(F, 13), text_color=MUTED).grid(
                row=2, column=0, columnspan=3, pady=40)
            return

        for i, course in enumerate(filtered):
            status = course.get("status", "")
            _, fg = STATUS_COLORS.get(status.upper(), (BORDER, MUTED))
            tutor_list = course.get("tutor_assignments", [])
            tutor = (f"{tutor_list[0]['tutor']['first_name']} {tutor_list[0]['tutor']['last_name']}"
                     if tutor_list else None)

            card = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=12, border_width=1, border_color=BORDER)
            card.grid(row=i + 2, column=0, columnspan=3, sticky="ew", pady=(0, 8))
            card.grid_columnconfigure(2, weight=1)

            icon_box = ctk.CTkFrame(card, fg_color=BLUE_LIGHT, corner_radius=10, width=44, height=44)
            icon_box.grid(row=0, column=0, padx=14, pady=14)
            icon_box.grid_propagate(False)
            ctk.CTkLabel(icon_box, text=subject.get("icon", "📚"), font=(F, 20)).place(
                relx=0.5, rely=0.5, anchor="center")

            info = ctk.CTkFrame(card, fg_color="transparent")
            info.grid(row=0, column=2, sticky="ew", pady=12)
            ctk.CTkLabel(info, text=course.get("subject", {}).get("code", ""),
                         font=(F, 13, "bold"), text_color=TEXT).grid(row=0, column=0, sticky="w")
            sub = f"👤 {tutor}  ·  " if tutor else ""
            ctk.CTkLabel(info, text=f"{sub}{status.capitalize()}", font=(F, 10), text_color=SUB).grid(
                row=1, column=0, sticky="w")

            ctk.CTkLabel(card, text="›", font=(F, 18), text_color=MUTED).grid(row=0, column=3, padx=16)

    # ── Profile tab ──────────────────────────────────────────────────
    def _build_profile_tab(self):
        tab = self._tabs.tab("Profile")
        sc = ctk.CTkScrollableFrame(tab, fg_color="transparent")
        sc.grid(row=0, column=0, sticky="nsew", padx=80, pady=16)
        sc.grid_columnconfigure(0, weight=1)

        user = Auth.user
        initials = (f"{user.get('first_name','')[0:1]}{user.get('last_name','')[0:1]}").upper()
        name  = f"{user.get('first_name','')} {user.get('last_name','')}"
        email = user.get("email", "")
        role  = user.get("role", "")

        # Avatar header
        hdr = ctk.CTkFrame(sc, fg_color=DARK, corner_radius=16)
        hdr.grid(row=0, column=0, sticky="ew", pady=(8, 14))
        hdr.grid_columnconfigure(0, weight=1)

        av = ctk.CTkFrame(hdr, fg_color=BLUE_MID, corner_radius=36, width=72, height=72)
        av.grid(row=0, column=0, pady=(24, 8))
        av.grid_propagate(False)
        ctk.CTkLabel(av, text=initials, font=(F, 24, "bold"), text_color=WHITE).place(
            relx=0.5, rely=0.5, anchor="center")
        ctk.CTkLabel(hdr, text=name, font=(F, 18, "bold"), text_color=WHITE).grid(row=1, column=0)
        ctk.CTkLabel(hdr, text=email, font=(F, 12), text_color="#90CAF9").grid(row=2, column=0)
        ctk.CTkLabel(hdr, text=f"  {role}  ", font=(F, 11, "bold"), text_color=WHITE,
                     fg_color=BLUE_MID, corner_radius=8).grid(row=3, column=0, pady=(6, 22))

        # Info card
        ic = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=14, border_width=1, border_color=BORDER)
        ic.grid(row=1, column=0, sticky="ew", pady=(0, 14))
        ic.grid_columnconfigure(1, weight=1)
        rows = [("🏫", "University", "NYU"),
                ("📞", "Phone", user.get("phone") or "—"),
                ("👤", "Username", f"@{user.get('username','')}")]
        for i, (icon, label, val) in enumerate(rows):
            if i:
                ctk.CTkFrame(ic, fg_color=BORDER, height=1).grid(
                    row=i * 2 - 1, column=0, columnspan=3, sticky="ew", padx=16)
            ctk.CTkLabel(ic, text=icon, font=(F, 16)).grid(row=i*2, column=0, padx=(16, 8), pady=14)
            ctk.CTkLabel(ic, text=label, font=(F, 12), text_color=SUB).grid(row=i*2, column=1, sticky="w")
            ctk.CTkLabel(ic, text=val, font=(F, 12, "bold"), text_color=TEXT).grid(
                row=i*2, column=2, padx=16)

        ctk.CTkButton(
            sc, text="Log Out", height=46, font=(F, 14, "bold"),
            fg_color="transparent", border_width=2, border_color=RED,
            text_color=RED, hover_color=RED_LIGHT, corner_radius=10,
            command=self._logout,
        ).grid(row=2, column=0, sticky="ew", pady=(0, 32))

    # ── Data loading ─────────────────────────────────────────────────
    def _load(self):
        threading.Thread(target=self._bg_load, daemon=True).start()

    def _bg_load(self):
        try:
            asgn = api_client.get_my_assignments(Auth.token)
            corr = api_client.get_my_corrections(Auth.token)
            crs  = api_client.get_courses(Auth.token)
            subj = api_client.get_subjects(Auth.token)
            svc  = api_client.get_services(Auth.token)
            self.after(0, lambda: self._on_data(asgn, corr, crs, subj, svc))
        except Exception as e:
            print(f"[StudentDashboard] load error: {e}")

    def _on_data(self, asgn, corr, crs, subj, svc):
        self._assignments = asgn
        self._corrections = corr
        self._courses     = crs
        self._subjects    = subj
        self._services    = svc
        self._refresh_assignments()
        self._refresh_browse()
        self._build_submit_form()

    def _logout(self):
        Auth.clear()
        self._on_logout()
