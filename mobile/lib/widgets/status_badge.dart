import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  const StatusBadge(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    final cfg = _cfg(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cfg.$1,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(cfg.$2,
        style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800, color: cfg.$3)),
    );
  }

  static (Color bg, String label, Color color) _cfg(String s) => switch (s) {
    'PENDING'     => (AppColors.orangeLight, '↑ Submitted',   AppColors.orange),
    'IN_PROGRESS' => (AppColors.blueLight,   '⟳ In Progress', AppColors.blue),
    'CORRECTED'   => (AppColors.greenLight,  '✓ Graded',      AppColors.green),
    'COMPLETED'   => (AppColors.greenLight,  '✅ Completed',   AppColors.green),
    _             => (AppColors.border,      s,               AppColors.sub),
  };
}
