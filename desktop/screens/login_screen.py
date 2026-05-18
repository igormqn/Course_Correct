import threading
import customtkinter as ctk
from core import api_client
from core.auth import Auth
from core.colors import *

F = "Segoe UI"


class LoginScreen(ctk.CTkFrame):
    def __init__(self, parent, on_login):
        super().__init__(parent, fg_color=BG, corner_radius=0)
        self._on_login = on_login
        self._build()

    # ─────────────────────────────────────────────────────────────────
    def _build(self):
        self.grid_columnconfigure(0, minsize=380, weight=0)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # ── Left dark panel ──────────────────────────────────────────
        left = ctk.CTkFrame(self, fg_color=DARK, corner_radius=0, width=380)
        left.grid(row=0, column=0, sticky="nsew")
        left.grid_propagate(False)
        left.grid_rowconfigure(0, weight=1)
        left.grid_columnconfigure(0, weight=1)

        inner = ctk.CTkFrame(left, fg_color="transparent")
        inner.grid(row=0, column=0)

        ctk.CTkLabel(inner, text="📖", font=(F, 56), text_color=WHITE).pack(pady=(0, 16))
        ctk.CTkLabel(inner, text="CourseCorrect", font=(F, 30, "bold"), text_color=WHITE).pack()
        ctk.CTkLabel(inner, text="NYU Academic Platform", font=(F, 13), text_color="#90CAF9").pack(pady=(4, 0))
        ctk.CTkLabel(
            inner, text="Assignment delivery\nExpert corrections",
            font=(F, 11), text_color=MUTED, justify="center",
        ).pack(pady=(10, 64))
        ctk.CTkLabel(inner, text="© 2025 CourseCorrect — NYU", font=(F, 10), text_color="#37474F").pack()

        # ── Right form ───────────────────────────────────────────────
        right = ctk.CTkFrame(self, fg_color=BG, corner_radius=0)
        right.grid(row=0, column=1, sticky="nsew")
        right.grid_rowconfigure(0, weight=1)
        right.grid_columnconfigure(0, weight=1)

        card = ctk.CTkFrame(right, fg_color=WHITE, corner_radius=16, border_width=1, border_color=BORDER)
        card.grid(row=0, column=0, padx=80, pady=80, sticky="nsew")
        card.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(card, text="Welcome back!", font=(F, 22, "bold"), text_color=TEXT).grid(
            row=0, column=0, padx=36, pady=(36, 2), sticky="w")
        ctk.CTkLabel(card, text="Sign in to your NYU account", font=(F, 12), text_color=SUB).grid(
            row=1, column=0, padx=36, sticky="w")

        self._err = ctk.CTkLabel(card, text="", font=(F, 12), text_color=RED, wraplength=360)
        self._err.grid(row=2, column=0, padx=36, pady=(8, 0), sticky="w")

        ctk.CTkLabel(card, text="USERNAME", font=(F, 10, "bold"), text_color=SUB).grid(
            row=3, column=0, padx=36, pady=(20, 4), sticky="w")
        self._user_e = ctk.CTkEntry(
            card, placeholder_text="alex.morgan", height=44, font=(F, 13),
            fg_color=WHITE, border_color=BORDER, text_color=TEXT, corner_radius=8,
        )
        self._user_e.grid(row=4, column=0, padx=36, sticky="ew")

        ctk.CTkLabel(card, text="PASSWORD", font=(F, 10, "bold"), text_color=SUB).grid(
            row=5, column=0, padx=36, pady=(16, 4), sticky="w")
        self._pass_e = ctk.CTkEntry(
            card, placeholder_text="••••••••", height=44, font=(F, 13),
            fg_color=WHITE, border_color=BORDER, text_color=TEXT, corner_radius=8, show="•",
        )
        self._pass_e.grid(row=6, column=0, padx=36, sticky="ew")
        self._pass_e.bind("<Return>", lambda _e: self._submit())

        self._btn = ctk.CTkButton(
            card, text="Sign In", height=48, font=(F, 14, "bold"),
            fg_color=BLUE, hover_color=DARK, corner_radius=10, command=self._submit,
        )
        self._btn.grid(row=7, column=0, padx=36, pady=(24, 0), sticky="ew")

        row_link = ctk.CTkFrame(card, fg_color="transparent")
        row_link.grid(row=8, column=0, pady=(12, 36))
        ctk.CTkLabel(row_link, text="No account? ", font=(F, 12), text_color=SUB).pack(side="left")
        ctk.CTkLabel(row_link, text="Contact your administrator.", font=(F, 12), text_color=MUTED).pack(side="left")

    # ─────────────────────────────────────────────────────────────────
    def _submit(self):
        u = self._user_e.get().strip()
        p = self._pass_e.get()
        if not u or not p:
            self._err.configure(text="Please fill in all fields.")
            return
        self._err.configure(text="")
        self._btn.configure(state="disabled", text="Signing in…")
        threading.Thread(target=self._bg_login, args=(u, p), daemon=True).start()

    def _bg_login(self, u, p):
        try:
            tokens = api_client.login(u, p)
            user = api_client.get_current_user(tokens["access"])
            Auth.set(tokens["access"], user)
            self.after(0, self._on_login)
        except Exception:
            self.after(0, self._on_error)

    def _on_error(self):
        self._err.configure(text="Invalid username or password.")
        self._btn.configure(state="normal", text="Sign In")
