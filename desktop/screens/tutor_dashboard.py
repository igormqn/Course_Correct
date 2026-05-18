import threading
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


class TutorDashboard(ctk.CTkFrame):
    def __init__(self, parent, on_logout):
        super().__init__(parent, fg_color=BG, corner_radius=0)
        self._on_logout = on_logout
        self._build()
        self._load()

    # ─────────────────────────────────────────────────────────────────
    def _build(self):
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # Nav bar
        nav = ctk.CTkFrame(self, fg_color=DARK, corner_radius=0, height=52)
        nav.grid(row=0, column=0, sticky="ew")
        nav.grid_propagate(False)
        nav.grid_columnconfigure(1, weight=1)

        user = Auth.user
        name = f"{user.get('first_name','')} {user.get('last_name','')}"
        ctk.CTkLabel(nav, text="📖  CourseCorrect", font=(F, 15, "bold"), text_color=WHITE).grid(
            row=0, column=0, padx=20, pady=14)
        ctk.CTkLabel(nav, text=f"👨‍🏫  {name}  ·  Tutor", font=(F, 12), text_color="#90CAF9").grid(
            row=0, column=1, padx=20, sticky="e")
        ctk.CTkButton(
            nav, text="Log Out", height=28, font=(F, 11, "bold"),
            fg_color="transparent", border_width=1, border_color="#546E7A",
            text_color="#90CAF9", hover_color=DARK, corner_radius=6,
            command=self._logout,
        ).grid(row=0, column=2, padx=(0, 16))

        # Tabs
        self._tabs = ctk.CTkTabview(
            self, fg_color=BG,
            segmented_button_fg_color=BG,
            segmented_button_selected_color=BLUE,
            segmented_button_selected_hover_color=DARK,
            segmented_button_unselected_color=BG,
            segmented_button_unselected_hover_color=BLUE_LIGHT,
        )
        self._tabs.grid(row=1, column=0, sticky="nsew")

        self._scrolls: dict[str, ctk.CTkScrollableFrame] = {}
        for tab_name in ("To Correct", "Completed"):
            self._tabs.add(tab_name)
            tab = self._tabs.tab(tab_name)
            tab.grid_rowconfigure(0, weight=1)
            tab.grid_columnconfigure(0, weight=1)
            sc = ctk.CTkScrollableFrame(tab, fg_color="transparent")
            sc.grid(row=0, column=0, sticky="nsew", padx=16, pady=8)
            sc.grid_columnconfigure(0, weight=1)
            ctk.CTkLabel(sc, text="Loading…", font=(F, 13), text_color=MUTED).grid(
                row=0, column=0, pady=60)
            self._scrolls[tab_name] = sc

    # ─────────────────────────────────────────────────────────────────
    def _load(self):
        threading.Thread(target=self._bg_load, daemon=True).start()

    def _bg_load(self):
        try:
            assignments = api_client.get_my_assignments(Auth.token)
            corrections = api_client.get_my_corrections(Auth.token)
            self.after(0, lambda: self._on_data(assignments, corrections))
        except Exception as e:
            print(f"[TutorDashboard] load error: {e}")

    def _on_data(self, assignments, corrections):
        corr_map = {c["assignment"]["id"]: c for c in corrections}
        pending  = [a for a in assignments if a.get("status") in ("PENDING", "IN_PROGRESS")]
        done     = [a for a in assignments if a.get("status") == "CORRECTED"]
        self._render(self._scrolls["To Correct"],  pending, corr_map, empty_msg="No assignments to correct",  empty_icon="📭")
        self._render(self._scrolls["Completed"], done,    corr_map, empty_msg="No completed corrections yet.", empty_icon="🎉")

    def _render(self, sc, assignments, corr_map, empty_msg, empty_icon):
        for w in sc.winfo_children():
            w.destroy()

        if not assignments:
            ctk.CTkLabel(sc, text=empty_icon, font=(F, 36)).grid(row=0, column=0, pady=(50, 8))
            ctk.CTkLabel(sc, text=empty_msg, font=(F, 14, "bold"), text_color=MUTED).grid(row=1, column=0)
            return

        for i, a in enumerate(assignments):
            status = a.get("status", "")
            _, bar_fg = STATUS_COLORS.get(status, (BORDER, MUTED))
            subject    = a.get("course", {}).get("subject", {})
            correction = corr_map.get(a["id"])
            student    = a.get("student") or {}
            sname      = f"{student.get('first_name','')} {student.get('last_name','')}".strip() or "—"
            date       = (a.get("submitted_at") or "")[:10] or "—"
            premium    = "⭐ Premium" if a.get("service", {}).get("is_premium") else "Standard"

            card = ctk.CTkFrame(sc, fg_color=WHITE, corner_radius=12, border_width=1, border_color=BORDER)
            card.grid(row=i, column=0, sticky="ew", pady=(0, 8))
            card.grid_columnconfigure(2, weight=1)

            ctk.CTkFrame(card, fg_color=bar_fg, corner_radius=6, width=4).grid(
                row=0, column=0, sticky="ns", padx=(0, 0), pady=0)

            ctk.CTkLabel(card, text=subject.get("icon", "📚"), font=(F, 24)).grid(
                row=0, column=1, padx=(10, 4), pady=16)

            info = ctk.CTkFrame(card, fg_color="transparent")
            info.grid(row=0, column=2, sticky="ew", padx=4, pady=14)
            info.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(info, text=subject.get("code", ""), font=(F, 13, "bold"), text_color=TEXT).grid(
                row=0, column=0, sticky="w")
            ctk.CTkLabel(info, text=f"👤 {sname}  ·  {date}  ·  {premium}",
                         font=(F, 10), text_color=SUB).grid(row=1, column=0, sticky="w")

            bg, fg = STATUS_COLORS.get(status, (BORDER, MUTED))
            ctk.CTkLabel(info, text=f"  {status}  ", font=(F, 9, "bold"),
                         text_color=fg, fg_color=bg, corner_radius=6).grid(
                row=2, column=0, sticky="w", pady=(6, 0))

            if correction and correction.get("grade") is not None:
                g  = correction["grade"]
                gc = GREEN if g >= 16 else BLUE if g >= 12 else ORANGE
                ctk.CTkLabel(card, text=f"{g}/20", font=(F, 16, "bold"), text_color=gc).grid(
                    row=0, column=3, padx=16)

    def _logout(self):
        Auth.clear()
        self._on_logout()
