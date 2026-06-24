-- ============================================================
-- Void Shards — Act I quests seed (World 01)
-- Run AFTER pretest_setup.sql (which creates public.quests).
-- Idempotent: clears World-1 rows then inserts exactly the 10 BUILT gates,
-- so the skill tree shows 10 (not the stale 15) and no ch11-15 node renders.
-- Reference data only — safe to re-run; touches no user data.
-- XP values match what each gate stores via completeQuest().
-- ============================================================

begin;

delete from public.quests where world = 1;

insert into public.quests (id, world, chapter, title, topic, xp, icon, is_boss, order_index) values
  ('act1-ch01', 1,  1, 'The Document Tomb',  'HTML Structure',      100, '📡',  false,  1),
  ('act1-ch02', 1,  2, 'The Semantic Crypt', 'Semantic HTML',       200, '⚱️',  false,  2),
  ('act1-ch03', 1,  3, 'The Form Gate',      'Forms & Inputs',      300, '⚗️',  true,   3),
  ('act1-ch04', 1,  4, 'Paint the City',     'CSS Custom Properties',240, '🎨',  false,  4),
  ('act1-ch05', 1,  5, 'The Gravity Anchor', 'Flexbox',             280, '🧲',  false,  5),
  ('act1-ch06', 1,  6, 'The Infinite Grid',  'CSS Grid',            500, '🌌',  true,   6),
  ('act1-ch07', 1,  7, 'Ghost Feedback',     'CSS Transitions',     350, '👻',  false,  7),
  ('act1-ch08', 1,  8, 'The Collapse',       'Responsive Design',   500, '📱',  true,   8),
  ('act1-ch09', 1,  9, 'The Control Room',   'JavaScript DOM',      450, '🎛️',  false,  9),
  ('act1-ch10', 1, 10, 'The Static City',    'Fetch API',           600, '🌐',  true,  10);

commit;
