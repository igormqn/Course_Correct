import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/colors.dart';
import 'assignments_screen.dart';
import 'profile_screen.dart';
import '../browse/subjects_screen.dart';

class StudentShell extends StatefulWidget {
  const StudentShell({super.key});
  @override
  State<StudentShell> createState() => _StudentShellState();
}

class _StudentShellState extends State<StudentShell> {
  int _index = 1; // default to Assignments tab

  final _screens = const [
    SubjectsScreen(),
    AssignmentsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.border, width: 1.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _index,
          onTap: (i) => setState(() => _index = i),
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.blue,
          unselectedItemColor: AppColors.muted,
          selectedLabelStyle: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w800),
          unselectedLabelStyle: GoogleFonts.nunito(fontSize: 11, fontWeight: FontWeight.w600),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Text('🏠', style: TextStyle(fontSize: 22)), label: 'Browse'),
            BottomNavigationBarItem(icon: Text('📋', style: TextStyle(fontSize: 22)), label: 'Assignments'),
            BottomNavigationBarItem(icon: Text('👤', style: TextStyle(fontSize: 22)), label: 'Profile'),
          ],
        ),
      ),
      floatingActionButton: _index == 1
        ? FloatingActionButton(
            onPressed: () => context.push('/student/submit'),
            backgroundColor: AppColors.blue,
            child: const Icon(Icons.add, color: Colors.white, size: 28),
          )
        : null,
    );
  }
}
