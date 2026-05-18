import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Web (Chrome) → localhost | Android emulator → 10.0.2.2 | iOS simulator → localhost
String get kBaseUrl {
  if (kIsWeb) return 'http://localhost:8000/api';
  return 'http://10.0.2.2:8000/api';
}

/// Normalise une réponse DRF : retourne la liste que ce soit paginé ou non.
List<dynamic> _asList(dynamic body) {
  if (body is List) return body;
  if (body is Map && body.containsKey('results')) return body['results'] as List;
  return [];
}

class ApiClient {
  static Future<String?> _token() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Map<String, String> _headers({bool auth = true, String? token}) => {
    'Content-Type': 'application/json',
    if (auth && token != null) 'Authorization': 'Bearer $token',
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/auth/login/'),
      headers: _headers(auth: false),
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception(jsonDecode(res.body)['detail'] ?? 'Invalid credentials');
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse('$kBaseUrl/users/'),
      headers: _headers(auth: false),
      body: jsonEncode(data),
    );
    if (res.statusCode == 201) return jsonDecode(res.body);
    final body = jsonDecode(res.body);
    throw Exception(body.values.first is List ? body.values.first.first : body.toString());
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    final token = await _token();
    final res = await http.get(
      Uri.parse('$kBaseUrl/users/me/'),
      headers: _headers(token: token),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception('Failed to fetch user');
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  static Future<List<dynamic>> getCourses() async {
    final res = await http.get(Uri.parse('$kBaseUrl/courses/'));
    if (res.statusCode == 200) return _asList(jsonDecode(res.body));
    throw Exception('Failed to load courses');
  }

  static Future<List<dynamic>> getSubjects() async {
    final res = await http.get(Uri.parse('$kBaseUrl/subjects/'));
    if (res.statusCode == 200) return _asList(jsonDecode(res.body));
    throw Exception('Failed to load subjects');
  }

  // ── Services ──────────────────────────────────────────────────────────────
  static Future<List<dynamic>> getServices() async {
    final res = await http.get(Uri.parse('$kBaseUrl/services/'));
    if (res.statusCode == 200) return _asList(jsonDecode(res.body));
    throw Exception('Failed to load services');
  }

  // ── Assignments ───────────────────────────────────────────────────────────
  static Future<List<dynamic>> getMyAssignments() async {
    final token = await _token();
    final res = await http.get(
      Uri.parse('$kBaseUrl/assignments/my_assignments/'),
      headers: _headers(token: token),
    );
    if (res.statusCode == 200) return _asList(jsonDecode(res.body));
    throw Exception('Failed to load assignments');
  }

  static Future<Map<String, dynamic>> submitAssignment({
    required int courseId,
    required int serviceId,
    required String filePath,
    required String fileName,
    required List<int> fileBytes,
  }) async {
    final token = await _token();
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$kBaseUrl/assignments/'),
    );
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['course_id'] = courseId.toString();
    request.fields['service_id'] = serviceId.toString();
    request.files.add(http.MultipartFile.fromBytes(
      'file',
      fileBytes,
      filename: fileName,
    ));
    final streamed = await request.send();
    final res = await http.Response.fromStream(streamed);
    if (res.statusCode == 201) return jsonDecode(res.body);
    throw Exception('Upload failed: ${res.body}');
  }

  // ── Corrections ───────────────────────────────────────────────────────────
  static Future<List<dynamic>> getMyCorrections() async {
    final token = await _token();
    final res = await http.get(
      Uri.parse('$kBaseUrl/corrections/'),
      headers: _headers(token: token),
    );
    if (res.statusCode == 200) return _asList(jsonDecode(res.body));
    throw Exception('Failed to load corrections');
  }
}
