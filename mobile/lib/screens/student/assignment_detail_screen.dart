import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/colors.dart';
import '../../core/api_client.dart';
import '../../widgets/status_badge.dart';

class AssignmentDetailScreen extends StatefulWidget {
  final int assignmentId;
  final Map? initialData;
  const AssignmentDetailScreen({super.key, required this.assignmentId, this.initialData});

  @override
  State<AssignmentDetailScreen> createState() => _AssignmentDetailScreenState();
}

class _AssignmentDetailScreenState extends State<AssignmentDetailScreen> {
  Map? _assignment;
  Map? _correction;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _assignment = widget.initialData;
    _load();
  }

  Future<void> _load() async {
    try {
      final corrections = await ApiClient.getMyCorrections();
      if (mounted) { setState(() {
        _correction = corrections.cast<Map?>().firstWhere(
          (c) => c?['assignment']['id'] == widget.assignmentId,
          orElse: () => null,
        );
        _loading = false;
      }); }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final a = _assignment;
    final status = a?['status'] as String? ?? '';
    final isPremium = a?['service']?['is_premium'] == true;
    final icon = a?['course']?['subject']?['icon'] ?? '📚';
    final grade = _correction?['grade'];

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: AppColors.dark,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
              onPressed: () => context.pop(),
            ),
            title: Text('Assignment Detail',
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
                    padding: const EdgeInsets.fromLTRB(20, 60, 20, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(a?['course']?['subject']?['name'] ?? '',
                            style: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(icon, style: const TextStyle(fontSize: 28)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(a?['course']?['subject']?['code'] ?? '',
                                style: GoogleFonts.nunito(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          if (_loading)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AppColors.blue)))
          else
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Status + service info
                  _card(children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        StatusBadge(status),
                        Text(isPremium ? '⭐ Premium' : 'Standard',
                          style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.text)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (a?['submitted_at'] != null)
                      _row('📅', 'Submitted', DateFormat('dd/MM/yyyy').format(DateTime.parse(a!['submitted_at']))),
                    _row('⏱', 'Turnaround', '${a?['service']?['turnaround_hours']}h'),
                    _row('💰', 'Price', '\$${a?['service']?['price'] ?? '0.00'}'),
                  ]),

                  const SizedBox(height: 12),

                  // Correction block
                  if (status == 'CORRECTED' && _correction != null) ...[
                    // Grade hero
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.dark, AppColors.blueMid],
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(grade != null && (grade as num) >= 16 ? '🏆 Excellent' : '📝 Graded',
                              style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text('${grade ?? '—'}',
                                style: GoogleFonts.nunito(fontSize: 52, fontWeight: FontWeight.w900, color: Colors.white)),
                              Text('/20',
                                style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white70)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(_correction!['tutor'] != null
                            ? '${_correction!['tutor']['first_name']} ${_correction!['tutor']['last_name']}'
                            : 'Correction received',
                            style: GoogleFonts.nunito(fontSize: 13, color: Colors.white70)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Comments
                    if (_correction!['comments']?.isNotEmpty == true)
                      _card(children: [
                        Text('Overall Comment',
                          style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.text)),
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.bg,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('👨‍🏫', style: TextStyle(fontSize: 18)),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(_correction!['comments'],
                                  style: GoogleFonts.nunito(fontSize: 13, color: AppColors.text, height: 1.5)),
                              ),
                            ],
                          ),
                        ),
                      ]),

                    const SizedBox(height: 12),

                    // Suggestions
                    if (_correction!['suggestions']?.isNotEmpty == true)
                      _card(children: [
                        Text('Suggestions',
                          style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.text)),
                        const SizedBox(height: 10),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(width: 4, height: 60, decoration: BoxDecoration(
                              color: AppColors.orange, borderRadius: BorderRadius.circular(4))),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(_correction!['suggestions'],
                                style: GoogleFonts.nunito(fontSize: 13, color: AppColors.text, height: 1.5)),
                            ),
                          ],
                        ),
                      ]),

                    const SizedBox(height: 12),

                    // Live badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border, width: 1.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: AppColors.green,
                              shape: BoxShape.circle,
                              boxShadow: [BoxShadow(color: AppColors.green.withValues(alpha: 0.5), blurRadius: 6)],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('Live updates enabled',
                            style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.green)),
                        ],
                      ),
                    ),
                  ] else if (status != 'CORRECTED') ...[
                    _card(children: [
                      const Text('⏳', style: TextStyle(fontSize: 36)),
                      const SizedBox(height: 8),
                      Text('Correction in progress',
                        style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.text)),
                      const SizedBox(height: 4),
                      Text('Your tutor will review your assignment and provide feedback.',
                        style: GoogleFonts.nunito(fontSize: 13, color: AppColors.sub, height: 1.5)),
                    ]),
                  ],

                  const SizedBox(height: 24),
                ]),
              ),
            ),
        ],
      ),
    );
  }

  Widget _card({required List<Widget> children}) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border, width: 1.5),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
  );

  Widget _row(String icon, String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(
      children: [
        Text(icon, style: const TextStyle(fontSize: 14)),
        const SizedBox(width: 8),
        Text(label, style: GoogleFonts.nunito(fontSize: 13, color: AppColors.sub)),
        const Spacer(),
        Text(value, style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.text)),
      ],
    ),
  );
}
