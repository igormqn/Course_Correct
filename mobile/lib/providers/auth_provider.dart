import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _loading = true;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;
  String get role => _user?['role'] ?? '';

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token != null) {
      try {
        _user = await ApiClient.getCurrentUser();
      } catch (_) {
        await prefs.remove('access_token');
        await prefs.remove('refresh_token');
      }
    }
    _loading = false;
    notifyListeners();
  }

  Future<String?> login(String username, String password) async {
    try {
      final tokens = await ApiClient.login(username, password);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('access_token', tokens['access']);
      await prefs.setString('refresh_token', tokens['refresh']);
      _user = await ApiClient.getCurrentUser();
      notifyListeners();
      return null; // success
    } catch (e) {
      return e.toString().replaceFirst('Exception: ', '');
    }
  }

  Future<String?> register(Map<String, dynamic> data) async {
    try {
      await ApiClient.register(data);
      return await login(data['username'], data['password']);
    } catch (e) {
      return e.toString().replaceFirst('Exception: ', '');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    _user = null;
    notifyListeners();
  }
}
