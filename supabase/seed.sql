-- AlumConnect Seed Data
-- Run this in Supabase SQL Editor after schema.sql

-- ============================================
-- 1. ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hashed)
INSERT INTO users (id, email, password, name, graduation_class, status, is_admin, approved_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@incheon-sci.hs.kr',
  '$2b$10$/vpaJqSkBdWcb0qHZVv.ceoRyHMsJA4WOkPF2KiwyOb4XhSSa3G8y',
  '관리자',
  1,
  'approved',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SAMPLE ALUMNI DATABASE
-- ============================================
-- These are sample entries for alumni matching during registration
INSERT INTO alumni (name, graduation_class, birth_year, is_registered) VALUES
  ('김철수', 1, 1990, false),
  ('이영희', 1, 1990, false),
  ('박민수', 2, 1991, false),
  ('정수진', 2, 1991, false),
  ('최동현', 3, 1992, false),
  ('강미영', 3, 1992, false),
  ('조현우', 4, 1993, false),
  ('윤서연', 4, 1993, false),
  ('임재현', 5, 1994, false),
  ('한지민', 5, 1994, false),
  ('신동욱', 10, 1999, false),
  ('오수빈', 10, 1999, false),
  ('장민호', 15, 2004, false),
  ('배수지', 15, 2004, false),
  ('권현진', 20, 2009, false),
  ('송지효', 20, 2009, false),
  ('홍길동', 25, 2014, false),
  ('김영수', 25, 2014, false),
  ('이민정', 30, 2019, false),
  ('박준형', 30, 2019, false)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. QUIZ QUESTIONS
-- ============================================
-- Basic questions (모든 기수 공통)
INSERT INTO quiz_questions (type, question, options, correct_index, difficulty) VALUES
  ('basic', '인천과학고등학교의 교훈은 무엇인가요?',
   ARRAY['창의', '성실', '탐구', '봉사'], 0, 'easy'),

  ('basic', '인천과학고등학교가 설립된 연도는?',
   ARRAY['1989년', '1990년', '1991년', '1992년'], 1, 'easy'),

  ('basic', '인천과학고등학교의 교화(校花)는?',
   ARRAY['장미', '목련', '무궁화', '백합'], 3, 'medium'),

  ('basic', '인천과학고등학교의 교목(校木)은?',
   ARRAY['소나무', '은행나무', '느티나무', '향나무'], 0, 'medium'),

  ('basic', '인천과학고등학교 학생들의 별칭은?',
   ARRAY['과학인', '청람인', '인과인', '탐구인'], 1, 'easy')
ON CONFLICT DO NOTHING;

-- Facility questions (학교 시설 관련)
INSERT INTO quiz_questions (type, question, options, correct_index, difficulty) VALUES
  ('facility', '인천과학고 본관 건물의 층수는?',
   ARRAY['3층', '4층', '5층', '6층'], 2, 'easy'),

  ('facility', '학교 도서관이 위치한 건물은?',
   ARRAY['본관', '과학관', '기숙사', '체육관'], 0, 'easy'),

  ('facility', '과학 실험실이 주로 위치한 곳은?',
   ARRAY['본관 1층', '본관 2층', '과학관', '별관'], 2, 'medium'),

  ('facility', '학교 운동장의 트랙 한 바퀴 거리는?',
   ARRAY['200m', '300m', '400m', '500m'], 2, 'medium'),

  ('facility', '기숙사 식당이 위치한 층은?',
   ARRAY['지하 1층', '1층', '2층', '3층'], 1, 'easy')
ON CONFLICT DO NOTHING;

-- Culture questions (학교 문화 관련)
INSERT INTO quiz_questions (type, question, options, correct_index, difficulty) VALUES
  ('culture', '인천과학고의 대표적인 학교 축제 이름은?',
   ARRAY['과학제', '청람제', '백합제', '탐구제'], 1, 'easy'),

  ('culture', '매년 개최되는 과학 경시대회의 이름은?',
   ARRAY['사이언스 올림피아드', '청람 과학대회', 'ISHS 과학제', '탐구 올림피아드'], 1, 'medium'),

  ('culture', '신입생 환영 행사의 전통적인 이름은?',
   ARRAY['새내기 배움터', '신입생 오리엔테이션', '청람 새내기 캠프', '과학 입문 캠프'], 2, 'medium'),

  ('culture', '졸업생들이 후배들에게 전하는 전통 행사는?',
   ARRAY['선배와의 대화', '청람 멘토링', '꿈나무 특강', '진로 콘서트'], 0, 'hard'),

  ('culture', '학교 교가에서 반복되는 핵심 가사는?',
   ARRAY['푸른 꿈을 향해', '청람의 빛', '과학의 미래', '탐구의 정신'], 1, 'hard')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SAMPLE INTRODUCTIONS (Optional)
-- ============================================
-- Uncomment to add sample introduction profiles

/*
INSERT INTO introductions (
  user_id, name, graduation_class, status, field, organization,
  location, self_introduction, looking_for, contact_preference
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '관리자',
  1,
  'employed',
  'IT/소프트웨어',
  '인천과학고 동문회',
  '인천',
  '인천과학고 동문 커뮤니티 AlumConnect를 관리하고 있습니다. 동문 여러분의 많은 참여 부탁드립니다!',
  'networking',
  'email'
);
*/

-- ============================================
-- VERIFICATION
-- ============================================
-- Check inserted data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Alumni', COUNT(*) FROM alumni
UNION ALL
SELECT 'Quiz Questions', COUNT(*) FROM quiz_questions;
