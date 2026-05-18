import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/colors.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/welcome_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/forgot_password_screen.dart';
import 'screens/student/student_shell.dart';
import 'screens/student/submit_screen.dart';
import 'screens/student/assignment_detail_screen.dart';
import 'screens/browse/courses_screen.dart';
import 'screens/browse/course_detail_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const CourseCorrectApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
    GoRoute(path: '/welcome', builder: (_, _) => const WelcomeScreen()),
    GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
    GoRoute(path: '/register', builder: (_, _) => const RegisterScreen()),
    GoRoute(path: '/forgot-password', builder: (_, _) => const ForgotPasswordScreen()),

    // Student shell (tabs: Browse | Assignments | Profile)
    GoRoute(
      path: '/student',
      builder: (_, _) => const StudentShell(),
      routes: [
        GoRoute(path: 'submit', builder: (_, _) => const SubmitScreen()),
        GoRoute(
          path: 'assignment/:id',
          builder: (ctx, state) {
            final id = int.parse(state.pathParameters['id']!);
            final extra = state.extra as Map?;
            return AssignmentDetailScreen(assignmentId: id, initialData: extra);
          },
        ),
      ],
    ),

    // Browse: subject → course list → course detail
    GoRoute(
      path: '/browse/:subjectId',
      builder: (ctx, state) {
        final id = int.parse(state.pathParameters['subjectId']!);
        final subject = state.extra as Map?;
        return CoursesScreen(subjectId: id, subject: subject);
      },
    ),
    GoRoute(
      path: '/browse/course/:courseId',
      builder: (ctx, state) => CourseDetailScreen(course: state.extra as Map? ?? {}),
    ),
  ],
);

class CourseCorrectApp extends StatelessWidget {
  const CourseCorrectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CourseCorrect',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.blue, primary: AppColors.blue),
        textTheme: GoogleFonts.nunitoTextTheme(),
        scaffoldBackgroundColor: AppColors.bg,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.dark,
          foregroundColor: Colors.white,
          elevation: 0,
          titleTextStyle: GoogleFonts.nunito(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.blue,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: GoogleFonts.nunito(fontWeight: FontWeight.w800),
          ),
        ),
      ),
    );
  }
}
