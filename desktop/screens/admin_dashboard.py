import threading
import customtkinter as ctk
from core import api_client
from core.auth import Auth
from core.colors import *

F = "Segoe UI"

MENU = [
    ("dashboard", "📊  Dashboard"),
    ("courses",   "📚  Courses"),
    ("students",  "👥  Students"),
    ("tutors",    "👨‍🏫  Tutors"),
    ("services",  "💼  Services"),
]


class AdminDashboard(ctk.CTkFrame):
    def __init__(self, parent, on_logout):
        super().__init__(parent, fg_color=BG, corner_radius=0)
        self._on_logout   = on_logout
        self._active      = "dashboard"
        self._sidebar_btns: dict[str, ctk.CTkButton] = {}
        self._courses:   list = []
        self._users:     list = []
        self._services:  list = []
        self._assignments: list = []
        self._build()
        self._load()

    # ─────────────────────────────────────────────────────────────────
    def _build(self):
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # ── Nav bar ──────────────────────────────────────────────────
        nav = ctk.CTkFrame(self, fg_color=DARK, corner_radius=0, height=52)
        nav.grid(row=0, column=0, sticky="ew")
        nav.grid_propagate(False)
        nav.grid_columnconfigure(1, weight=1)

        user = Auth.user
        name = f"{user.get('first_name','')} {user.get('last_name','')}"
        ctk.CTkLabel(nav, text="📖  CourseCorrect  ·  Admin", font=(F, 15, "bold"), text_color=WHITE).grid(
            row=0, column=0, padx=20, pady=14)
        ctk.CTkLabel(nav, text=f"🔑  {name}", font=(F, 12), text_color="#90CAF9").grid(
            row=0, column=1, padx=20, sticky="e")
        ctk.CTkButton(
            nav, text="Log Out", height=28, font=(F, 11, "bold"),
            fg_color="transparent", border_width=1, border_color="#546E7A",
            text_color="#90CAF9", hover_color=DARK, corner_radius=6,
            command=self._logout,
        ).grid(row=0, column=2, padx=(0, 16))

        # ── Main area: sidebar + content ─────────────────────────────
        main = ctk.CTkFrame(self, fg_color=BG, corner_radius=0)
        main.grid(row=1, column=0, sticky="nsew")
        main.grid_rowconfigure(0, weight=1)
        main.grid_columnconfigure(1, weight=1)

        # Sidebar
        sidebar = ctk.CTkFrame(main, fg_color=DARK, corner_radius=0, width=210)
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_propagate(False)
        sidebar.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(sidebar, text="NAVIGATION", font=(F, 10, "bold"), text_color="#37474F").grid(
            row=0, column=0, padx=16, pady=(22, 10), sticky="w")

        for i, (key, label) in enumerate(MENU):
            btn = ctk.CTkButton(
                sidebar, text=label, anchor="w", height=40, font=(F, 13),
                fg_color=BLUE if key == self._active else "transparent",
                hover_color=BLUE, text_color=WHITE, corner_radius=8,
                command=lambda k=key: self._switch(k),
            )
            btn.grid(row=i + 1, column=0, padx=8, pady=2, sticky="ew")
            self._sidebar_btns[key] = btn

        # Content area
        self._content = ctk.CTkFrame(main, fg_color=BG, corner_radius=0)
        self._content.grid(row=0, column=1, sticky="nsew")
        self._content.grid_rowconfigure(0, weight=1)
        self._content.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(self._content, text="Loading data…", font=(F, 14), text_color=MUTED).grid(
            row=0, column=0)

    # ─────────────────────────────────────────────────────────────────
    def _switch(self, key: str):
        for k, btn in self._sidebar_btns.items():
            btn.configure(fg_color=BLUE if k == key else "transparent")
        self._active = key
        self._render()

    def _load(self):
        threading.Thread(target=self._bg_load, daemon=True).start()

    def _bg_load(self):
        try:
            courses     = api_client.get_courses(Auth.token)
            users       = api_client.get_all_users(Auth.token)
            services    = api_client.get_services(Auth.token)
            assignments = api_client.get_my_assignments(Auth.token)
            self.after(0, lambda: self._on_data(courses, users, services, assignments))
        except Exception as e:
            print(f"[AdminDashboard] load error: {e}")
            self.after(0, self._render)

    def _on_data(self, courses, users, services, assignments):
        self._courses     = courses
        self._users       = users
        self._services    = services
        self._assignments = assignments
        self._render()

    # ─────────────────────────────────────────────────────────────────
    def _render(self):
        for w in self._content.winfo_children():
            w.destroy()

        sc = ctk.CTkScrollableFrame(self._content, fg_color="transparent")
        sc.grid(row=0, column=0, sticky="nsew", padx=24, pady=20)
        sc.grid_columnconfigure(0, weight=1)

        dispatch = {
            "dashboard": self._page_dashboard,
            "courses":   lambda s: self._page_table(
                s, "Courses",
                ["Code", "Subject", "Semester", "Tutor", "Status"],
                [[c.get("subject", {}).get("code", ""),
                  c.get("subject", {}).get("name", ""),
                  c.get("semester", ""),
                  self._tutor_name(c),
                  c.get("status", "")]
                 for c in self._courses],
            ),
            "students": lambda s: self._page_table(
                s, "Students",
                ["Name", "Email", "Username"],
                [[f"{u['first_name']} {u['last_name']}", u.get("email", ""), u.get("username", "")]
                 for u in self._users if u.get("role") == "STUDENT"],
            ),
            "tutors": lambda s: self._page_table(
                s, "Tutors",
                ["Name", "Email", "Username"],
                [[f"{u['first_name']} {u['last_name']}", u.get("email", ""), u.get("username", "")]
                 for u in self._users if u.get("role") == "TUTOR"],
            ),
            "services": lambda s: self._page_table(
                s, "Services",
                ["Name", "Turnaround", "Price", "Premium"],
                [[sv["name"], f"{sv.get('turnaround_hours')}h",
                  f"${sv.get('price')}", "⭐ Yes" if sv.get("is_premium") else "No"]
                 for sv in self._services],
            ),
        }
        dispatch.get(self._active, self._page_dashboard)(sc)

    # ── Pages ────────────────────────────────────────────────────────
    def _page_dashboard(self, sc):
        ctk.CTkLabel(sc, text="Overview", font=(F, 20, "bold"), text_color=TEXT).grid(
            row=0, column=0, sticky="w", pady=(0, 18))

        students = [u for u in self._users if u.get("role") == "STUDENT"]
        tutors   = [u for u in self._users if u.get("role") == "TUTOR"]
        kpis = [
            ("📚", "Courses",     len(self._courses)),
            ("👥", "Students",    len(students)),
            ("👨‍🏫", "Tutors",     len(tutors)),
            ("📋", "Assignments", len(self._assignments)),
        ]

        kpi_row = ctk.CTkFrame(sc, fg_color="transparent")
        kpi_row.grid(row=1, column=0, sticky="ew", pady=(0, 24))
        for i in range(4):
            kpi_row.grid_columnconfigure(i, weight=1)

        for i, (icon, label, val) in enumerate(kpis):
            pad_r = 0 if i == 3 else 8
            card = ctk.CTkFrame(kpi_row, fg_color=WHITE, corner_radius=14,
                                border_width=1, border_color=BORDER)
            card.grid(row=0, column=i, padx=(0, pad_r), sticky="ew")
            card.grid_columnconfigure(0, weight=1)
            ctk.CTkLabel(card, text=icon, font=(F, 30)).grid(row=0, column=0, pady=(18, 4))
            ctk.CTkLabel(card, text=str(val), font=(F, 26, "bold"), text_color=TEXT).grid(row=1, column=0)
            ctk.CTkLabel(card, text=label, font=(F, 11), text_color=SUB).grid(row=2, column=0, pady=(2, 18))

        ctk.CTkLabel(sc, text="Recent Courses", font=(F, 14, "bold"), text_color=TEXT).grid(
            row=2, column=0, sticky="w", pady=(0, 10))
        self._table_widget(
            sc, row=3,
            columns=["Code", "Subject", "Semester", "Tutor", "Status"],
            rows=[[c.get("subject", {}).get("code", ""),
                   c.get("subject", {}).get("name", ""),
                   c.get("semester", ""),
                   self._tutor_name(c),
                   c.get("status", "")]
                  for c in self._courses[:8]],
        )

    def _page_table(self, sc, title, columns, rows):
        ctk.CTkLabel(sc, text=title, font=(F, 20, "bold"), text_color=TEXT).grid(
            row=0, column=0, sticky="w", pady=(0, 16))
        self._table_widget(sc, row=1, columns=columns, rows=rows)

    def _table_widget(self, parent, row, columns, rows):
        """Render a clean striped table."""
        table = ctk.CTkFrame(parent, fg_color=WHITE, corner_radius=12,
                             border_width=1, border_color=BORDER)
        table.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        for j in range(len(columns)):
            table.grid_columnconfigure(j, weight=1)

        # Header
        for j, col in enumerate(columns):
            ctk.CTkLabel(table, text=col, font=(F, 11, "bold"), text_color=SUB,
                         fg_color=BG).grid(row=0, column=j, padx=16, pady=10, sticky="w")

        if not rows:
            ctk.CTkLabel(table, text="No data available.", font=(F, 12), text_color=MUTED).grid(
                row=1, column=0, columnspan=len(columns), padx=16, pady=20)
            return

        for i, data_row in enumerate(rows):
            stripe = WHITE if i % 2 == 0 else BG
            for j, cell in enumerate(data_row):
                ctk.CTkLabel(table, text=str(cell), font=(F, 12), text_color=TEXT,
                             fg_color=stripe).grid(row=i + 1, column=j, padx=16, pady=9, sticky="w")

    # ─────────────────────────────────────────────────────────────────
    @staticmethod
    def _tutor_name(course: dict) -> str:
        tas = course.get("tutor_assignments") or []
        if not tas:
            return "—"
        t = tas[0].get("tutor", {})
        return f"{t.get('first_name','')} {t.get('last_name','')}".strip() or "—"

    def _logout(self):
        Auth.clear()
        self._on_logout()
