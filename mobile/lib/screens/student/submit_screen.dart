import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/colors.dart';
import '../../core/api_client.dart';

class SubmitScreen extends StatefulWidget {
  const SubmitScreen({super.key});
  @override
  State<SubmitScreen> createState() => _SubmitScreenState();
}

class _SubmitScreenState extends State<SubmitScreen> {
  List _courses = [];
  List _services = [];
  int? _selectedCourse;
  int? _selectedService;
  PlatformFile? _pickedFile;
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        ApiClient.getCourses(),
        ApiClient.getServices(),
      ]);
      if (mounted) { setState(() {
        _courses = results[0];
        _services = results[1];
        if (_services.isNotEmpty) { _selectedService = _services[0]['id']; }
        _loading = false;
      }); }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() => _pickedFile = result.files.first);
    }
  }

  Future<void> _submit() async {
    if (_selectedCourse == null) { setState(() => _error = 'Please select a course'); return; }
    if (_pickedFile == null)     { setState(() => _error = 'Please upload a file'); return; }
    if (_selectedService == null){ setState(() => _error = 'Please select a service'); return; }
    setState(() { _submitting = true; _error = null; });
    try {
      await ApiClient.submitAssignment(
        courseId: _selectedCourse!,
        serviceId: _selectedService!,
        filePath: _pickedFile!.path ?? '',
        fileName: _pickedFile!.name,
        fileBytes: _pickedFile!.bytes ?? [],
      );
      if (mounted) setState(() { _submitting = false; _success = true; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString().replaceFirst('Exception: ', ''); _submitting = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_success) return _successView(context);

    final selectedCourse = _courses.isEmpty ? null
      : _courses.firstWhere((c) => c['id'] == _selectedCourse, orElse: () => null);
    final selectedService = _services.isEmpty ? null
      : _services.firstWhere((s) => s['id'] == _selectedService, orElse: () => null);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.dark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Text('Submit Assignment',
          style: GoogleFonts.nunito(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator(color: AppColors.blue))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
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

                // 1. Course selection
                _section('1. Select Course', child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border, width: 1.5),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<int>(
                      value: _selectedCourse,
                      isExpanded: true,
                      hint: Text('Choose a course', style: GoogleFonts.nunito(fontSize: 13, color: AppColors.muted)),
                      style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.text),
                      items: _courses.map<DropdownMenuItem<int>>((c) => DropdownMenuItem(
                        value: c['id'] as int,
                        child: Text('${c['subject']?['icon'] ?? '📚'} ${c['subject']?['code']}'),
                      )).toList(),
                      onChanged: (v) => setState(() => _selectedCourse = v),
                    ),
                  ),
                )),

                const SizedBox(height: 16),

                // Course hero (if selected)
                if (selectedCourse != null) Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.dark, AppColors.blueMid]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(selectedCourse['subject']?['name'] ?? '',
                          style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                      ),
                      const SizedBox(height: 8),
                      Text(selectedCourse['subject']?['code'] ?? '',
                        style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _chip('📅 ${selectedCourse['status']?.toUpperCase()}'),
                          const SizedBox(width: 8),
                          if (selectedCourse['tutor_assignments']?.isNotEmpty == true)
                            _chip('👤 ${selectedCourse['tutor_assignments'][0]['tutor']['first_name']} ${selectedCourse['tutor_assignments'][0]['tutor']['last_name']}'),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // 2. File upload
                _section('2. Upload File', child: GestureDetector(
                  onTap: _pickFile,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _pickedFile != null ? AppColors.green : AppColors.blue,
                        width: 2,
                        style: BorderStyle.solid,
                      ),
                    ),
                    child: Column(children: [
                      Text(_pickedFile != null ? '✅' : '📎', style: const TextStyle(fontSize: 32)),
                      const SizedBox(height: 8),
                      Text(
                        _pickedFile != null ? _pickedFile!.name : 'Drop your file here',
                        style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.text),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _pickedFile != null ? '${(_pickedFile!.size / 1024).toStringAsFixed(0)} KB' : 'PDF, DOC, DOCX · Max 20MB',
                        style: GoogleFonts.nunito(fontSize: 11, color: AppColors.muted),
                      ),
                    ]),
                  ),
                )),

                const SizedBox(height: 16),

                // 3. Service selection
                _section('3. Correction Type', child: Column(
                  children: _services.map((s) {
                    final isPremium = s['is_premium'] == true;
                    final selected = _selectedService == s['id'];
                    return GestureDetector(
                      onTap: () => setState(() => _selectedService = s['id']),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.blueLight : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: selected ? AppColors.blue : AppColors.border, width: 1.5),
                        ),
                        child: Row(
                          children: [
                            Text(isPremium ? '⭐' : '📝', style: const TextStyle(fontSize: 22)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text('${isPremium ? '⭐ ' : ''}${s['name']}',
                                  style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.text)),
                                Text('${s['turnaround_hours']}h turnaround',
                                  style: GoogleFonts.nunito(fontSize: 11, color: AppColors.sub)),
                              ]),
                            ),
                            Text('\$${s['price']}',
                              style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.blue)),
                            const SizedBox(width: 8),
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: selected ? AppColors.blue : AppColors.border, width: 2),
                                color: selected ? AppColors.blue : Colors.white,
                              ),
                              child: selected ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                )),

                const SizedBox(height: 8),

                // Order summary
                if (selectedCourse != null && selectedService != null)
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border, width: 1.5),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppColors.blue,
                            borderRadius: const BorderRadius.only(topLeft: Radius.circular(12), topRight: Radius.circular(12)),
                          ),
                          child: Row(children: [
                            Text('Order Summary',
                              style: GoogleFonts.nunito(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                          ]),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(children: [
                            _summaryRow('Course', selectedCourse['subject']?['code'] ?? ''),
                            _summaryRow('Service', selectedService['name']),
                            _summaryRow('Turnaround', '${selectedService['turnaround_hours']}h'),
                            const Divider(height: 20),
                            Row(children: [
                              Text('Total', style: GoogleFonts.nunito(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.text)),
                              const Spacer(),
                              Text('\$${selectedService['price']}',
                                style: GoogleFonts.nunito(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.blue)),
                            ]),
                          ]),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _submitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _submitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('✅ Confirm Submission',
                          style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
                  ),
                ),

                const SizedBox(height: 8),
                Center(
                  child: Text('🔒 Secure · Cancel before grading starts',
                    style: GoogleFonts.nunito(fontSize: 11, color: AppColors.muted)),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
    );
  }

  Widget _successView(BuildContext context) => Scaffold(
    backgroundColor: AppColors.bg,
    body: SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('✅', style: TextStyle(fontSize: 72)),
            const SizedBox(height: 24),
            Text('Submitted!', style: GoogleFonts.nunito(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.green)),
            const SizedBox(height: 8),
            Text('Your assignment has been submitted successfully. Your tutor will review it shortly.',
              textAlign: TextAlign.center,
              style: GoogleFonts.nunito(fontSize: 14, color: AppColors.sub, height: 1.6)),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => context.go('/student'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.blue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: Text('Back to My Assignments',
                  style: GoogleFonts.nunito(fontSize: 15, fontWeight: FontWeight.w800)),
              ),
            ),
          ],
        ),
      ),
    ),
  );

  Widget _section(String title, {required Widget child}) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border, width: 1.5),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.sub)),
          const SizedBox(height: 10),
          child,
        ]),
      ),
    ],
  );

  Widget _chip(String text) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(text, style: GoogleFonts.nunito(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
  );

  Widget _summaryRow(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(children: [
      Text(label, style: GoogleFonts.nunito(fontSize: 12, color: AppColors.sub)),
      const Spacer(),
      Text(value, style: GoogleFonts.nunito(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.text)),
    ]),
  );
}
