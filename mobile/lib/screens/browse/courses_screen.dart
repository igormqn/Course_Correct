import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import '../../core/api_client.dart';

class CoursesScreen extends StatefulWidget {
  final int subjectId;
  final Map? subject;
  const CoursesScreen({super.key, required this.subjectId, this.subject});
  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  List _courses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final all = await ApiClient.getCourses();
      final filtered = all.where((c) => c['subject']?['id'] == widget.subjectId).toList();
      if (mounted) setState(() { _courses = filtered; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final subject = widget.subject;
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (subject?['icon'] != null) Text(subject!['icon'], style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Text(subject?['name'] ?? 'Courses',
              style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
          ],
        ),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.blue))
        : _courses.isEmpty
          ? Center(
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Text('📚', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 12),
                Text('No courses available',
                  style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.text)),
              ]),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _courses.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final course = _courses[i];
                final tutor = course['tutor_assignments']?.isNotEmpty == true
                  ? course['tutor_assignments'][0]['tutor']
                  : null;
                final status = course['status'] as String? ?? '';
                final statusCfg = switch (status) {
                  'active'   => (AppColors.greenLight, AppColors.green, '● Active'),
                  'upcoming' => (AppColors.blueLight, AppColors.blue, '◎ Upcoming'),
                  _          => (AppColors.border, AppColors.muted, '● Past'),
                };

                return GestureDetector(
                  onTap: () => context.push('/browse/course/${course['id']}', extra: course),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border, width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.blueLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(child: Text(subject?['icon'] ?? '📚', style: const TextStyle(fontSize: 22))),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(course['subject']?['code'] ?? '',
                                style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.text)),
                              const SizedBox(height: 2),
                              Row(children: [
                                if (tutor != null) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.bg,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text('👤 ${tutor['first_name']} ${tutor['last_name']}',
                                      style: GoogleFonts.nunito(fontSize: 10, color: AppColors.sub, fontWeight: FontWeight.w700)),
                                  ),
                                  const SizedBox(width: 6),
                                ],
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: statusCfg.$1,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(statusCfg.$3,
                                    style: GoogleFonts.nunito(fontSize: 10, color: statusCfg.$2, fontWeight: FontWeight.w800)),
                                ),
                              ]),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
