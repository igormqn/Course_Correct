import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _ctrl = TextEditingController();
  bool _sent = false;
  bool _loading = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  Future<void> _send() async {
    if (_ctrl.text.isEmpty) return;
    setState(() => _loading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() { _loading = false; _sent = true; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.text, size: 20),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🔑', style: TextStyle(fontSize: 48)),
              const SizedBox(height: 16),
              Text('Forgot Password',
                style: GoogleFonts.nunito(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.text)),
              const SizedBox(height: 8),
              Text('Enter your NYU email to receive a secure reset link.',
                style: GoogleFonts.nunito(fontSize: 14, color: AppColors.sub, height: 1.5)),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.blueLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Text('ℹ️', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'A secure email will be sent to your @nyu.edu address with a link valid for 30 minutes.',
                        style: GoogleFonts.nunito(fontSize: 12, color: AppColors.blue, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              Text('UNIVERSITY EMAIL',
                style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.sub, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              TextField(
                controller: _ctrl,
                keyboardType: TextInputType.emailAddress,
                style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
                decoration: InputDecoration(
                  hintText: 'your.name@nyu.edu',
                  hintStyle: GoogleFonts.nunito(color: AppColors.muted),
                  filled: true,
                  fillColor: AppColors.bg,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.blue, width: 1.5)),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _send,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('Send Reset Link', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                ),
              ),

              if (_sent) ...[
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.greenLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.green.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Text('✅', style: TextStyle(fontSize: 24)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Email sent!',
                            style: GoogleFonts.nunito(fontWeight: FontWeight.w900, color: AppColors.green)),
                          Text('Check your @nyu.edu inbox',
                            style: GoogleFonts.nunito(fontSize: 12, color: AppColors.sub)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],

              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Remembered? ', style: GoogleFonts.nunito(color: AppColors.sub, fontSize: 13)),
                  GestureDetector(
                    onTap: () => context.go('/login'),
                    child: Text('Sign In', style: GoogleFonts.nunito(color: AppColors.blue, fontWeight: FontWeight.w800, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
