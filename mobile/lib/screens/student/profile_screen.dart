import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/colors.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: AppColors.dark,
            pinned: true,
            title: Text('My Profile',
              style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            centerTitle: true,
            actions: [
              IconButton(
                icon: const Text('✏️', style: TextStyle(fontSize: 18)),
                onPressed: () {},
              ),
            ],
          ),

          SliverToBoxAdapter(
            child: Column(
              children: [
                // Avatar + name
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.dark, AppColors.blueMid],
                    ),
                  ),
                  child: Column(children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${user?['first_name']?[0] ?? ''}${user?['last_name']?[0] ?? ''}',
                          style: GoogleFonts.nunito(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text('${user?['first_name']} ${user?['last_name']}',
                      style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                    const SizedBox(height: 4),
                    Text(user?['email'] ?? '',
                      style: GoogleFonts.nunito(fontSize: 13, color: Colors.white70)),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(user?['role'] ?? '',
                        style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                    ),
                  ]),
                ),

                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Info card
                      _card([
                        _row('🏫', 'University', 'NYU'),
                        _divider(),
                        _row('📞', 'Phone', user?['phone']?.isNotEmpty == true ? user!['phone'] : '—'),
                        _divider(),
                        _row('👤', 'Username', '@${user?['username'] ?? ''}'),
                      ]),

                      const SizedBox(height: 12),

                      // Settings card
                      _card([
                        _rowAction('🔔', 'Notifications', () {}),
                        _divider(),
                        _rowAction('💳', 'Payments', () {}),
                        _divider(),
                        _rowAction('🔐', 'Security', () {}),
                      ]),

                      const SizedBox(height: 20),

                      // Logout
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () async {
                            await context.read<AuthProvider>().logout();
                            if (context.mounted) context.go('/welcome');
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.red,
                            side: const BorderSide(color: AppColors.red, width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text('Log Out',
                            style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.red)),
                        ),
                      ),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _card(List<Widget> children) => Container(
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border, width: 1.5),
    ),
    child: Column(children: children),
  );

  Widget _row(String icon, String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    child: Row(children: [
      Text(icon, style: const TextStyle(fontSize: 18)),
      const SizedBox(width: 12),
      Text(label, style: GoogleFonts.nunito(fontSize: 13, color: AppColors.sub)),
      const Spacer(),
      Text(value, style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.text)),
    ]),
  );

  Widget _rowAction(String icon, String label, VoidCallback onTap) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(children: [
        Text(icon, style: const TextStyle(fontSize: 18)),
        const SizedBox(width: 12),
        Text(label, style: GoogleFonts.nunito(fontSize: 13, color: AppColors.text)),
        const Spacer(),
        const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
      ]),
    ),
  );

  Widget _divider() => const Divider(height: 1, indent: 48, color: AppColors.border);
}
