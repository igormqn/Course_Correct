import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/api_client.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key});
  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  List _subjects = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient.getSubjects();
      if (mounted) setState(() { _subjects = data; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  static const _bgColors = [
    Color(0xFFE3F2FD),
    Color(0xFFE8F5E9),
    Color(0xFFFFF8E1),
    Color(0xFFFCE4EC),
    Color(0xFFEDE7F6),
    Color(0xFFE0F7FA),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: AppColors.dark,
            pinned: true,
            title: RichText(
              text: TextSpan(
                style: GoogleFonts.nunito(fontSize: 17),
                children: const [
                  TextSpan(text: '📖  ', style: TextStyle(fontWeight: FontWeight.w400)),
                  TextSpan(text: 'Course', style: TextStyle(fontWeight: FontWeight.w300, color: Colors.white)),
                  TextSpan(text: 'Correct', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
                ],
              ),
            ),
            centerTitle: true,
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Choose a Subject',
                    style: GoogleFonts.nunito(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.text)),
                  Text('Browse courses by department',
                    style: GoogleFonts.nunito(fontSize: 13, color: AppColors.sub)),
                ],
              ),
            ),
          ),

          if (_loading)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AppColors.blue)))
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.1,
                ),
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) {
                    final s = _subjects[i];
                    final bg = _bgColors[i % _bgColors.length];
                    return GestureDetector(
                      onTap: () => context.push('/browse/${s['id']}', extra: s),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border, width: 1.5),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
                              child: Center(child: Text(s['icon'] ?? '📚', style: const TextStyle(fontSize: 28))),
                            ),
                            const SizedBox(height: 10),
                            Text(s['name'],
                              style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.text),
                              textAlign: TextAlign.center),
                            const SizedBox(height: 2),
                            Text(s['code'] ?? '',
                              style: GoogleFonts.nunito(fontSize: 11, color: AppColors.muted)),
                          ],
                        ),
                      ),
                    );
                  },
                  childCount: _subjects.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
