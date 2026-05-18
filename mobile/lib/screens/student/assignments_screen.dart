import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../core/colors.dart';
import '../../core/api_client.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/status_badge.dart';

class AssignmentsScreen extends StatefulWidget {
  const AssignmentsScreen({super.key});
  @override
  State<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  List _assignments = [];
  List _corrections = [];
  bool _loading = true;
  String _filter = 'ALL';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final results = await Future.wait([
        ApiClient.getMyAssignments(),
        ApiClient.getMyCorrections(),
      ]);
      if (mounted) { setState(() {
        _assignments = results[0];
        _corrections = results[1];
        _loading = false;
      }); }
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List get _filtered => _assignments.where((a) {
    if (_filter == 'ALL') return true;
    return a['status'] == _filter;
  }).toList();

  Map? _correctionFor(int id) {
    try { return _corrections.firstWhere((c) => c['assignment']['id'] == id); }
    catch (_) { return null; }
  }

  int get _total => _assignments.length;
  int get _graded => _assignments.where((a) => a['status'] == 'CORRECTED').length;
  double get _avg {
    final graded = _corrections.where((c) => c['grade'] != null).toList();
    if (graded.isEmpty) return 0;
    return graded.fold<double>(0, (s, c) => s + (c['grade'] as num)) / graded.length;
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: RefreshIndicator(
        onRefresh: _load,
        color: AppColors.blue,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.dark, AppColors.blueMid],
                  ),
                ),
                padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 20),
                child: Column(
                  children: [
                    // User row
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(child: Text('👤', style: TextStyle(fontSize: 22))),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${user?['first_name']} ${user?['last_name']}',
                                style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                              Text('NYU · Student',
                                style: GoogleFonts.nunito(fontSize: 12, color: Colors.white70)),
                            ],
                          ),
                        ),
                        const Icon(Icons.notifications_none, color: Colors.white70, size: 26),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // KPIs
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _kpi('$_total', 'Assignments'),
                        _kpi('$_graded', 'Graded'),
                        _kpi(
                          _avg > 0 ? _avg.toStringAsFixed(1) : '—',
                          'Avg./20',
                          highlighted: true,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Filter tabs
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    children: [
                      for (final f in [
                        ('ALL', 'All'),
                        ('IN_PROGRESS', 'In Progress'),
                        ('CORRECTED', 'Graded'),
                        ('PENDING', 'Submitted'),
                      ])
                        Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => setState(() => _filter = f.$1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: _filter == f.$1 ? AppColors.blue : AppColors.bg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: _filter == f.$1 ? AppColors.blue : AppColors.border,
                                  width: 1.5,
                                ),
                              ),
                              child: Text(f.$2,
                                style: GoogleFonts.nunito(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: _filter == f.$1 ? Colors.white : AppColors.sub,
                                )),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // List
            if (_loading)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AppColors.blue)))
            else if (_filtered.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('📭', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 12),
                      Text('No assignments yet', style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.text)),
                      const SizedBox(height: 6),
                      Text('Tap + to submit your first assignment', style: GoogleFonts.nunito(fontSize: 13, color: AppColors.sub)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (ctx, i) {
                      final a = _filtered[i];
                      final correction = _correctionFor(a['id']);
                      final grade = correction?['grade'];
                      final status = a['status'] as String;
                      final isPremium = a['service']?['is_premium'] == true;
                      final icon = a['course']?['subject']?['icon'] ?? '📚';
                      final dateStr = a['submitted_at'] != null
                        ? DateFormat('dd/MM/yyyy').format(DateTime.parse(a['submitted_at']))
                        : '—';
                      final statusColors = {
                        'CORRECTED':   AppColors.green,
                        'IN_PROGRESS': AppColors.blue,
                        'PENDING':     AppColors.orange,
                      };
                      final leftColor = statusColors[status] ?? AppColors.muted;

                      return GestureDetector(
                        onTap: () => context.push('/student/assignment/${a['id']}', extra: a),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border, width: 1.5),
                          ),
                          child: Row(
                            children: [
                              Container(width: 4, height: 80, decoration: BoxDecoration(color: leftColor, borderRadius: const BorderRadius.only(topLeft: Radius.circular(14), bottomLeft: Radius.circular(14)))),
                              const SizedBox(width: 14),
                              Text(icon, style: const TextStyle(fontSize: 26)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(a['course']?['subject']?['code'] ?? '',
                                        style: GoogleFonts.nunito(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.text)),
                                      const SizedBox(height: 2),
                                      Text('$dateStr · ${isPremium ? '⭐ Premium' : 'Standard'}',
                                        style: GoogleFonts.nunito(fontSize: 11, color: AppColors.sub)),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          StatusBadge(status),
                                          if (grade != null) ...[
                                            const SizedBox(width: 8),
                                            Text('$grade/20',
                                              style: GoogleFonts.nunito(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w900,
                                                color: (grade as num) >= 16 ? AppColors.green : (grade >= 12 ? AppColors.blue : AppColors.orange),
                                              )),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const Padding(
                                padding: EdgeInsets.only(right: 14),
                                child: Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    childCount: _filtered.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _kpi(String value, String label, {bool highlighted = false}) => Column(
    children: [
      Text(value, style: GoogleFonts.nunito(
        fontSize: 22, fontWeight: FontWeight.w900,
        color: highlighted ? const Color(0xFF90CAF9) : Colors.white)),
      Text(label, style: GoogleFonts.nunito(fontSize: 11, color: Colors.white70)),
    ],
  );
}
