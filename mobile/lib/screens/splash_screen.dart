import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/colors.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(milliseconds: 1800));
    if (!mounted) return;
    final auth = context.read<AuthProvider>();
    if (auth.isAuthenticated) {
      final role = auth.role;
      if (role == 'STUDENT') { context.go('/student'); }
      else if (role == 'TUTOR') { context.go('/student'); } // tutor reuses shell
      else if (role == 'ADMIN') { context.go('/student'); }
    } else {
      context.go('/welcome');
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [AppColors.dark, AppColors.blueMid],
          ),
        ),
        child: FadeTransition(
          opacity: _fade,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('📖', style: TextStyle(fontSize: 72)),
                const SizedBox(height: 16),
                RichText(
                  text: TextSpan(
                    style: GoogleFonts.nunito(fontSize: 32, color: Colors.white),
                    children: const [
                      TextSpan(text: 'Course', style: TextStyle(fontWeight: FontWeight.w400)),
                      TextSpan(text: 'Correct', style: TextStyle(fontWeight: FontWeight.w900)),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'NYU · Academic Platform',
                  style: GoogleFonts.nunito(fontSize: 14, color: Colors.white70),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    color: Colors.white.withValues(alpha: 0.6),
                    strokeWidth: 2.5,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
