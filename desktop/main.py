import customtkinter as ctk
from core.auth import Auth
from screens.login_screen import LoginScreen
from screens.student_dashboard import StudentDashboard
from screens.tutor_dashboard import TutorDashboard
from screens.admin_dashboard import AdminDashboard

ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

ROLE_SCREEN = {
    "STUDENT": StudentDashboard,
    "TUTOR":   TutorDashboard,
    "ADMIN":   AdminDashboard,
}


class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("CourseCorrect — NYU")
        self.geometry("1280x800")
        self.minsize(960, 640)
        self._frame: ctk.CTkFrame | None = None
        self._show_login()

    def _show_login(self):
        self._switch(LoginScreen(self, on_login=self._on_login))

    def _on_login(self):
        cls = ROLE_SCREEN.get(Auth.get_role(), StudentDashboard)
        self._switch(cls(self, on_logout=self._show_login))

    def _switch(self, frame: ctk.CTkFrame):
        if self._frame:
            self._frame.destroy()
        self._frame = frame
        self._frame.pack(fill="both", expand=True)


if __name__ == "__main__":
    app = App()
    app.mainloop()
