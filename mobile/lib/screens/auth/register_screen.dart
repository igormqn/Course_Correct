import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/colors.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  int _step = 0; // 0 = info, 1 = password
  String _role = 'STUDENT';
  final _firstNameCtrl   = TextEditingController();
  final _lastNameCtrl    = TextEditingController();
  final _usernameCtrl    = TextEditingController();
  final _emailCtrl       = TextEditingController();
  final _passwordCtrl    = TextEditingController();
  final _confirmCtrl     = TextEditingController();
  bool _obscure1 = true;
  bool _obscure2 = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [_firstNameCtrl, _lastNameCtrl, _usernameCtrl, _emailCtrl, _passwordCtrl, _confirmCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  void _nextStep() {
    if (_formKey.currentState!.validate()) setState(() => _step = 1);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passwordCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    setState(() { _loading = true; _error = null; });
    final err = await context.read<AuthProvider>().register({
      'username': _usernameCtrl.text.trim(),
      'email': _emailCtrl.text.trim(),
      'password': _passwordCtrl.text,
      'first_name': _firstNameCtrl.text.trim(),
      'last_name': _lastNameCtrl.text.trim(),
      'role': _role,
    });
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
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.text, size: 20),
          onPressed: () => _step == 1 ? setState(() => _step = 0) : context.go('/welcome'),
        ),
        title: Text('Create Account',
          style: GoogleFonts.nunito(color: AppColors.text, fontWeight: FontWeight.w900, fontSize: 17)),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: Row(
            children: List.generate(2, (i) => Expanded(
              child: Container(
                height: 3,
                color: i <= _step ? AppColors.blue : AppColors.border,
              ),
            )),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Step ${_step + 1} of 2',
                  style: GoogleFonts.nunito(fontSize: 12, color: AppColors.muted, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(_step == 0 ? 'Your Information' : 'Set a Password',
                  style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.text)),
                const SizedBox(height: 24),

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

                if (_step == 0) ...[
                  // Role picker
                  _label('I am a…'),
                  Row(children: [
                    _roleCard('STUDENT', '👨‍🎓', 'Student'),
                    const SizedBox(width: 12),
                    _roleCard('TUTOR', '👨‍🏫', 'Tutor'),
                  ]),
                  const SizedBox(height: 20),

                  Row(children: [
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _label('First Name'),
                      _input(_firstNameCtrl, 'Alex', validator: (v) => v!.isEmpty ? 'Required' : null),
                    ])),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _label('Last Name'),
                      _input(_lastNameCtrl, 'Morgan', validator: (v) => v!.isEmpty ? 'Required' : null),
                    ])),
                  ]),
                  const SizedBox(height: 16),

                  _label('Username'),
                  _input(_usernameCtrl, 'alex.morgan', validator: (v) => v!.isEmpty ? 'Required' : null),
                  const SizedBox(height: 16),

                  _label('University Email'),
                  _input(_emailCtrl, 'alex.morgan@nyu.edu',
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => v!.isEmpty ? 'Required' : null),
                  const SizedBox(height: 32),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _nextStep,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: Text('Continue →', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                    ),
                  ),
                ],

                if (_step == 1) ...[
                  _label('Password'),
                  _input(_passwordCtrl, 'Min 8 characters',
                    obscure: _obscure1,
                    validator: (v) => v!.length < 8 ? 'At least 8 characters' : null,
                    suffix: IconButton(
                      icon: Icon(_obscure1 ? Icons.visibility_off : Icons.visibility, color: AppColors.muted, size: 20),
                      onPressed: () => setState(() => _obscure1 = !_obscure1),
                    ),
                  ),
                  const SizedBox(height: 16),

                  _label('Confirm Password'),
                  _input(_confirmCtrl, '••••••••',
                    obscure: _obscure2,
                    validator: (v) => v!.isEmpty ? 'Required' : null,
                    suffix: IconButton(
                      icon: Icon(_obscure2 ? Icons.visibility_off : Icons.visibility, color: AppColors.muted, size: 20),
                      onPressed: () => setState(() => _obscure2 = !_obscure2),
                    ),
                  ),
                  const SizedBox(height: 32),

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
                        : Text('Create Account', style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                    ),
                  ),
                ],

                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Already have an account? ', style: GoogleFonts.nunito(color: AppColors.sub, fontSize: 13)),
                    GestureDetector(
                      onTap: () => context.go('/login'),
                      child: Text('Sign In', style: GoogleFonts.nunito(color: AppColors.blue, fontWeight: FontWeight.w800, fontSize: 13)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleCard(String value, String icon, String label) => Expanded(
    child: GestureDetector(
      onTap: () => setState(() => _role = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: _role == value ? AppColors.blueLight : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _role == value ? AppColors.blue : AppColors.border,
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 6),
            Text(label, style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.text)),
          ],
        ),
      ),
    ),
  );

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(text.toUpperCase(),
      style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.sub, letterSpacing: 0.5)),
  );

  Widget _input(TextEditingController ctrl, String hint, {
    bool obscure = false,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    Widget? suffix,
  }) => TextFormField(
    controller: ctrl,
    obscureText: obscure,
    keyboardType: keyboardType,
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
