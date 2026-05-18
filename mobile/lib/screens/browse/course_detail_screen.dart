import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';

class CourseDetailScreen extends StatelessWidget {
  final Map course;
  const CourseDetailScreen({super.key, required this.course});

  @override
  Widget build(BuildContext context) {
    final subject = course['subject'] as Map? ?? {};
    final tutorAssignments = course['tutor_assignments'] as List? ?? [];
    final tutor = tutorAssignments.isNotEmpty ? tutorAssignments[0]['tutor'] as Map? : null;
    final status = course['status'] as String? ?? '';

    final statusCfg = switch (status) {
      'active'   => ('● ACTIVE',   Colors.white, Colors.white.withValues(alpha: 0.2)),
      'upcoming' => ('◎ UPCOMING', Colors.white, Colors.white.withValues(alpha: 0.2)),
      _          => ('● PAST',     Colors.white70, Colors.white.withValues(alpha: 0.1)),
    };

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppColors.dark,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
              onPressed: () => context.pop(),
            ),
            title: Text('Course Detail',
              style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.dark, AppColors.blueMid],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusCfg.$3,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(statusCfg.$1,
                            style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.w800, color: statusCfg.$2)),
                        ),
                        const SizedBox(height: 10),
                        Text(subject['code'] ?? '',
                          style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                        const SizedBox(height: 4),
                        Text('${course['semester'] ?? ''} · ${subject['name'] ?? ''}',
                          style: GoogleFonts.nunito(fontSize: 12, color: Colors.white70)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _statChip('34', 'Students'),
                            const SizedBox(width: 8),
                            _statChip('6', 'Handouts'),
                            const SizedBox(width: 8),
                            _statChip('4.8★', 'Rating', highlighted: true),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Tutor card
                if (tutor != null) ...[
                  _card(children: [
                    Text('TUTOR',
                      style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.sub, letterSpacing: 0.5)),
                    const SizedBox(height: 10),
                    Row(children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(color: AppColors.blueLight, shape: BoxShape.circle),
                        child: const Center(child: Text('👨‍🏫', style: TextStyle(fontSize: 20))),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${tutor['first_name']} ${tutor['last_name']}',
                            style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.text)),
                          Text(subject['name'] ?? '',
                            style: GoogleFonts.nunito(fontSize: 12, color: AppColors.sub)),
                        ],
                      ),
                    ]),
                  ]),
                  const SizedBox(height: 12),
                ],

                // Description
                _card(children: [
                  Text('DESCRIPTION',
                    style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.sub, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  Text(course['description']?.isNotEmpty == true
                    ? course['description']
                    : 'Course in ${subject['name'] ?? 'this subject'}.',
                    style: GoogleFonts.nunito(fontSize: 13, color: AppColors.text, height: 1.6)),
                ]),

                const SizedBox(height: 16),

                // Submit button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.push('/student/submit'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Text('📤  Submit an Assignment',
                      style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                  ),
                ),

                const SizedBox(height: 24),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statChip(String value, String label, {bool highlighted = false}) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(children: [
      Text(value, style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w900,
        color: highlighted ? const Color(0xFF90CAF9) : Colors.white)),
      Text(label, style: GoogleFonts.nunito(fontSize: 9, color: Colors.white60)),
    ]),
  );

  Widget _card({required List<Widget> children}) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border, width: 1.5),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
  );
}
