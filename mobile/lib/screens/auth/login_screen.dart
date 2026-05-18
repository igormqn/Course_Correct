import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/colors.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    final err = await context.read<AuthProvider>().login(
      _usernameCtrl.text.trim(),
      _passwordCtrl.text,
    );
    if (!mounted) return;
    if (err != null) {
      setState(() { _error = err; _loading = false; });
    } else {
      context.go('/student');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Top blue area
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 36),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.dark, AppColors.blueMid],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(28),
                    bottomRight: Radius.circular(28),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: () => context.go('/welcome'),
                      child: const Icon(Icons.arrow_back_ios, color: Colors.white70, size: 20),
                    ),
                    const SizedBox(height: 24),
                    const Text('📖', style: TextStyle(fontSize: 36)),
                    const SizedBox(height: 12),
                    Text('Welcome back!',
                      style: GoogleFonts.nunito(fontSize: 26, fontWeight: FontWeight.w900, color: Colors.white)),
                    Text('Sign in to your NYU account',
                      style: GoogleFonts.nunito(fontSize: 14, color: Colors.white70)),
                  ],
                ),
              ),

              // Form
              Padding(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_error != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.redLight,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.red.withValues(alpha: 0.3)),
                          ),
                          child: Text(_error!, style: GoogleFonts.nunito(color: AppColors.red, fontSize: 13, fontWeight: FontWeight.w700)),
                        ),
                        const SizedBox(height: 16),
                      ],

                      _label('Username'),
                      _input(
                        controller: _usernameCtrl,
                        hint: 'alex.morgan',
                        validator: (v) => v!.isEmpty ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),

                      _label('Password'),
                      _input(
                        controller: _passwordCtrl,
                        hint: '••••••••',
                        obscure: _obscure,
                        validator: (v) => v!.isEmpty ? 'Required' : null,
                        suffix: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility,
                              color: AppColors.muted, size: 20),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                      const SizedBox(height: 8),

                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => context.go('/forgot-password'),
                          child: Text('Forgot password?',
                            style: GoogleFonts.nunito(color: AppColors.blue, fontWeight: FontWeight.w700, fontSize: 13)),
                        ),
                      ),
                      const SizedBox(height: 8),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _loading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _loading
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : Text('Sign In', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                        ),
                      ),
                      const SizedBox(height: 24),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("No account yet? ", style: GoogleFonts.nunito(color: AppColors.sub, fontSize: 13)),
                          GestureDetector(
                            onTap: () => context.go('/register'),
                            child: Text('Sign Up', style: GoogleFonts.nunito(color: AppColors.blue, fontWeight: FontWeight.w800, fontSize: 13)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(text.toUpperCase(),
      style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.sub, letterSpacing: 0.5)),
  );

  Widget _input({
    required TextEditingController controller,
    required String hint,
    bool obscure = false,
    String? Function(String?)? validator,
    Widget? suffix,
  }) => TextFormField(
    controller: controller,
    obscureText: obscure,
    validator: validator,
    style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
    decoration: InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.nunito(color: AppColors.muted, fontSize: 14),
      suffixIcon: suffix,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.blue, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.red, width: 1.5)),
      focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.red, width: 1.5)),
    ),
  );
}
