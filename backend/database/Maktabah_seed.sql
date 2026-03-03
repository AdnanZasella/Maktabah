  -- Top-level fields
 INSERT INTO fields (name, parent_field_id) VALUES ('Aqeedah', NULL);
  INSERT INTO fields (name, parent_field_id) VALUES ('Fiqh', NULL);
  INSERT INTO fields (name, parent_field_id) VALUES ('Hadith', NULL);
  INSERT INTO fields (name, parent_field_id) VALUES ('Seerah', NULL);

    -- Subfields Aqeedah
  INSERT INTO fields (name, parent_field_id) VALUES ('Ruboobiyah', 1);
  INSERT INTO fields (name, parent_field_id) VALUES ('Ulohiyyah', 1);
    INSERT INTO fields (name, parent_field_id) VALUES ('Al asma wa sifat', 1);

    -- Subfields Fiqh
  INSERT INTO fields (name, parent_field_id) VALUES ('Hanafi', 2);
  INSERT INTO fields (name, parent_field_id) VALUES ('Maliki', 2);
  INSERT INTO fields (name, parent_field_id) VALUES ('Shafii', 2);
  INSERT INTO fields (name, parent_field_id) VALUES ('Hanbali', 2);

   -- Subfields Hadith
  INSERT INTO fields (name, parent_field_id) VALUES
  ('Mustalah al-Hadith', 3),
  ('Hadith Collections', 3),
  ('Hadith Commentary (Sharh)', 3),
  ('Arbaeen & Selected Hadith', 3);

	-- Subfield Seerah
  INSERT INTO fields (name, parent_field_id) VALUES
  ('Classical Seerah Works', 4),
  ('Seerah Summaries', 4),
  ('Shamail (Prophetic Characteristics)', 4);


  -- One test book
 INSERT INTO books (title, author, field_id, level, description, pdf_filename)
  VALUES ('Usool al-Thalatha', 'Muhammad ibn Abd al-Wahhab', 5, 'beginner',
          'Foundational text in Aqeedah covering three essential questions.',
          'aqeedah/usool-al-thalatha.pdf');

	----------------- Aqeedah ------------------------------------

 -- Ruboobiyah
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Sharh al-Aqeedah al-Tahawiyyah',
     'Ibn Abi al-Izz al-Hanafi',
     (SELECT id FROM fields WHERE name = 'Ruboobiyah'),
     'advanced',
     'A detailed commentary on the creed of Imam al-Tahawi, establishing the correct Sunni understanding of tawheed al-rububiyyah and refuting deviant sects.',
     'aqeedah/sharh-aqeedah-tahawiyyah.pdf'),

    ('Sharh al-Aqeedah al-Wasitiyyah',
     'Imam Ibn al-Uthaymeen',
     (SELECT id FROM fields WHERE name = 'Ruboobiyah'),
     'intermediate',
     'Ibn al-Uthaymeen''s widely studied explanation of Ibn Taymiyyah''s Wasitiyyah, accessible and precise in clarifying the creed of the Salaf.',
     'aqeedah/sharh-wasitiyyah-uthaymeen.pdf');

	  -- Ulohiyyah
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Kitab al-Tawheed',
     'Muhammad ibn Abd al-Wahhab',
     (SELECT id FROM fields WHERE name = 'Ulohiyyah'),
     'beginner',
     'The foundational text on tawheed al-uluhiyyah. Uses Quran and Sunnah to establish the correct understanding of worshipping Allah alone, chapter by chapter.',
     'aqeedah/kitab-al-tawheed.pdf'),

    ('Fath al-Majeed Sharh Kitab al-Tawheed',
     'Abd al-Rahman ibn Hasan Aal al-Sheikh',
     (SELECT id FROM fields WHERE name = 'Ulohiyyah'),
     'intermediate',
     'The most comprehensive and authoritative commentary on Kitab al-Tawheed, with extensive references from Quran, Sunnah, and the scholars of the Salaf.',
     'aqeedah/fath-al-majeed.pdf'),

    ('Al-Qawl al-Sadeed fi Maqasid al-Tawheed',
     'Abd al-Rahman ibn Nasir al-Sa''di',
     (SELECT id FROM fields WHERE name = 'Ulohiyyah'),
     'beginner',
     'A clear and accessible explanation of the objectives and categories of tawheed by the great Najdi scholar, suitable for those beginning their study.',
     'aqeedah/qawl-al-sadeed.pdf'),

    ('Al-Qawl al-Mufid Sharh Kitab al-Tawheed',
     'Imam Ibn al-Uthaymeen',
     (SELECT id FROM fields WHERE name = 'Ulohiyyah'),
     'advanced',
     'Ibn al-Uthaymeen''s in-depth three-volume commentary on Kitab al-Tawheed, considered one of the finest explanations of the book in the modern era.',
     'aqeedah/qawl-al-mufid.pdf');

  -- Al-Asma wa Sifat
	   INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Lum''at al-I''tiqad',
     'Ibn Qudamah al-Maqdisi',
     (SELECT id FROM fields WHERE name = 'Al asma wa sifat'),
     'beginner',
     'A brief and accessible summary of the correct creed regarding the names and attributes of Allah, following strictly the way of the Salaf without ta''weel or ta''teel.',
     'aqeedah/lumat-al-itiqad.pdf'),

    ('Al-Tadmuriyyah',
     'Ibn Taymiyyah',
     (SELECT id FROM fields WHERE name = 'Al asma wa sifat'),
     'intermediate',
     'A rigorous epistemological and theological treatise establishing the Salafi methodology in affirming the divine names and attributes against both the Mutakallimeen and the Mu''attilah.',
     'aqeedah/al-tadmuriyyah.pdf'),

    ('Al-Aqeedah al-Hamawiyyah',
     'Ibn Taymiyyah',
     (SELECT id FROM fields WHERE name = 'Al asma wa sifat'),
     'intermediate',
     'Written as a fatwa response, this treatise is one of Ibn Taymiyyah''s clearest expositions of the Salafi position on the divine attributes, with extensive use of Quran and Sunnah.',
     'aqeedah/al-hamawiyyah.pdf'),

    ('Mukhtasar al-Sawaa''iq al-Mursalah',
     'Ibn al-Qayyim al-Jawziyyah',
     (SELECT id FROM fields WHERE name = 'Al asma wa sifat'),
     'advanced',
     'An abridgment of Ibn al-Qayyim''s comprehensive refutation of those who deny or reinterpret the divine attributes. One of the most thorough defenses of the Salafi position ever written.',
     'aqeedah/mukhtasar-sawaaiq.pdf');




	  -- ── FIQH ─────────────────────────────────────────────────────────────────

  -- Hanafi
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Al-Hidayah fi Sharh Bidayat al-Mubtadi',
     'Imam al-Marghinani',
     (SELECT id FROM fields WHERE name = 'Hanafi'),
     'advanced',
     'The most authoritative classical reference in the Hanafi school, used by scholars for centuries across the Muslim world. The basis for countless later Hanafi commentaries.',
     'fiqh/al-hidayah.pdf'),

    ('Maraqi al-Falah Sharh Nur al-Idah',
     'Imam al-Shurunbulali',
     (SELECT id FROM fields WHERE name = 'Hanafi'),
     'intermediate',
     'The author''s own commentary on his Nur al-Idah, expanding on the rulings with their reasoning and evidences. A key text in the Hanafi curriculum.',
     'fiqh/maraqi-al-falah.pdf');

  -- Maliki
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Al-Risalah',
     'Ibn Abi Zayd al-Qayrawani',
     (SELECT id FROM fields WHERE name = 'Maliki'),
     'beginner',
     'The most widely studied introductory text in Maliki fiqh, covering both creed and practical rulings. Memorised and taught across North Africa and West Africa for centuries.',
     'fiqh/al-risalah.pdf'),

    ('Al-Ashal al-Masalik Sharh Tuhfat al-Salik',
     'Imam al-Azhari',
     (SELECT id FROM fields WHERE name = 'Maliki'),
     'beginner',
     'A clear beginner-level explanation of Maliki fiqh, widely used in West African Islamic schools as an accessible entry into the Maliki tradition.',
     'fiqh/ashal-al-masalik.pdf'),

    ('Mukhtasar Khalil',
     'Khalil ibn Ishaq al-Jundi',
     (SELECT id FROM fields WHERE name = 'Maliki'),
     'advanced',
     'The central reference text of the Maliki school. Dense and comprehensive, it summarises the rulings of the madhab and is the basis for the major later Maliki commentaries.',
     'fiqh/mukhtasar-khalil.pdf'),

    ('Bidayat al-Mujtahid wa Nihayat al-Muqtasid',
     'Ibn Rushd al-Qurtubi',
     (SELECT id FROM fields WHERE name = 'Maliki'),
     'advanced',
     'A masterpiece of comparative fiqh presenting the positions and evidences of all four schools on major issues, written from within the Maliki tradition by one of its greatest scholars.',
     'fiqh/bidayat-al-mujtahid.pdf');

  -- Shafi''i
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Matn Abi Shuja'' (al-Ghayah wa al-Taqrib)',
     'Abu Shuja'' al-Asfahani',
     (SELECT id FROM fields WHERE name = 'Shafii'),
     'beginner',
     'The most widely memorised beginner text in Shafi''i fiqh. Concise and comprehensive, it covers all essential chapters from taharah to inheritance.',
     'fiqh/matn-abi-shuja.pdf'),

    ('Fath al-Qarib al-Mujib',
     'Ibn Qasim al-Ghazzi',
     (SELECT id FROM fields WHERE name = 'Shafii'),
     'beginner',
     'A clear and well-organised commentary on Matn Abi Shuja'', making it accessible for students beginning their study of Shafi''i fiqh.',
     'fiqh/fath-al-qarib.pdf'),

    ('Minhaj al-Talibin',
     'Imam al-Nawawi',
     (SELECT id FROM fields WHERE name = 'Shafii'),
     'intermediate',
     'The foundational intermediate reference of the later Shafi''i school. Imam al-Nawawi''s abridgement of al-Muharrar, it became the basis for the major Shafi''i commentaries.',
     'fiqh/minhaj-al-talibin.pdf'),

    ('Al-Majmu'' Sharh al-Muhadhdhab',
     'Imam al-Nawawi',
     (SELECT id FROM fields WHERE name = 'Shafii'),
     'advanced',
     'One of the most encyclopedic works in all of Islamic jurisprudence. Imam al-Nawawi''s monumental commentary on al-Shirazi''s text, covering Shafi''i fiqh with comparative analysis of all
  schools.',
     'fiqh/al-majmu.pdf');

  -- Hanbali
  INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES
    ('Akhsar al-Mukhtasarat',
     'Ibn Balban al-Hanbali',
     (SELECT id FROM fields WHERE name = 'Hanbali'),
     'beginner',
     'The most concise and commonly taught beginner text in Hanbali fiqh, covering worship, transactions, and family law in a form suitable for memorisation.',
     'fiqh/akhsar-al-mukhtasarat.pdf'),

    ('Al-Umdah fi al-Fiqh',
     'Ibn Qudamah al-Maqdisi',
     (SELECT id FROM fields WHERE name = 'Hanbali'),
     'beginner',
     'A concise and reliable beginner text in Hanbali fiqh by the author of al-Mughni, designed as a starting point before progressing to more detailed works.',
     'fiqh/al-umdah.pdf'),

    ('Dalil al-Talib li Nayl al-Matalib',
     'Mar''i ibn Yusuf al-Karmi',
     (SELECT id FROM fields WHERE name = 'Hanbali'),
     'intermediate',
     'A widely studied intermediate Hanbali fiqh primer, detailed enough to build real understanding while remaining accessible to committed students.',
     'fiqh/dalil-al-talib.pdf'),

    ('Zaad al-Mustaqni',
     'Sharaf al-Din al-Hajawi',
     (SELECT id FROM fields WHERE name = 'Hanbali'),
     'intermediate',
     'A concise but comprehensive Hanbali fiqh text that became one of the most studied books in the Hanbali curriculum, the basis for many later commentaries including al-Rawdh al-Murbi''.',
     'fiqh/zaad-al-mustaqni.pdf'),

    ('Al-Mughni',
     'Ibn Qudamah al-Maqdisi',
     (SELECT id FROM fields WHERE name = 'Hanbali'),
     'advanced',
     'The most important encyclopedic work in Hanbali fiqh, presenting every ruling with its evidence and comparative analysis across all four schools. An indispensable reference for serious
  students.',
     'fiqh/al-mughni.pdf');

---------------- Hadith ------------------------------




-- Mustalahul Hadith

INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Muqaddimah Ibn al-Salah',
 'Ibn al-Salah',
 (SELECT id FROM fields WHERE name = 'Mustalah al-Hadith'),
 'advanced',
 'The foundational classical work in hadith sciences. Nearly every later scholar built upon this manual in defining authentic, weak, and fabricated narrations.',
 'hadith/muqaddimah-ibn-al-salah.pdf'),

('Nukhbat al-Fikar',
 'Ibn Hajar al-Asqalani',
 (SELECT id FROM fields WHERE name = 'Mustalah al-Hadith'),
 'intermediate',
 'A concise and systematic summary of hadith sciences that became one of the most studied primers in the field.',
 'hadith/nukhbat-al-fikar.pdf'),

('Tadrib al-Rawi',
 'Jalal al-Din al-Suyuti',
 (SELECT id FROM fields WHERE name = 'Mustalah al-Hadith'),
 'advanced',
 'An expanded commentary on Muqaddimah Ibn al-Salah, compiling and refining earlier scholarship in hadith methodology.',
 'hadith/tadrib-al-rawi.pdf');




 -- Hadith collection

 INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Sahih al-Bukhari',
 'Imam al-Bukhari',
 (SELECT id FROM fields WHERE name = 'Hadith Collections'),
 'advanced',
 'The most authentic collection of hadith in Sunni Islam, compiled with the strictest criteria of authenticity.',
 'hadith/sahih-bukhari.pdf'),

('Sahih Muslim',
 'Imam Muslim ibn al-Hajjaj',
 (SELECT id FROM fields WHERE name = 'Hadith Collections'),
 'advanced',
 'Second only to Sahih al-Bukhari in authenticity, known for its precise organization and chains of narration.',
 'hadith/sahih-muslim.pdf'),

('Sunan Abu Dawud',
 'Abu Dawud al-Sijistani',
 (SELECT id FROM fields WHERE name = 'Hadith Collections'),
 'intermediate',
 'One of the six major hadith collections, focusing primarily on legal narrations.',
 'hadith/sunan-abu-dawud.pdf'),

('Jami al-Tirmidhi',
 'Imam al-Tirmidhi',
 (SELECT id FROM fields WHERE name = 'Hadith Collections'),
 'intermediate',
 'A major hadith collection notable for including grading of narrations and scholarly commentary.',
 'hadith/jami-al-tirmidhi.pdf');


-- Hadith Commentary (sharh)

INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Fath al-Bari',
 'Ibn Hajar al-Asqalani',
 (SELECT id FROM fields WHERE name = 'Hadith Commentary (Sharh)'),
 'advanced',
 'The most authoritative and detailed commentary on Sahih al-Bukhari, regarded as one of the greatest works in Islamic scholarship.',
 'hadith/fath-al-bari.pdf'),

('Sharh Sahih Muslim',
 'Imam al-Nawawi',
 (SELECT id FROM fields WHERE name = 'Hadith Commentary (Sharh)'),
 'advanced',
 'The standard Sunni commentary on Sahih Muslim, combining linguistic explanation with legal insight.',
 'hadith/sharh-sahih-muslim.pdf');


 -- Arbaeen books & Selected hadith

 INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Al-Arbaeen al-Nawawiyyah',
 'Imam al-Nawawi',
 (SELECT id FROM fields WHERE name = 'Arbaeen & Selected Hadith'),
 'beginner',
 'A collection of forty-two foundational hadith covering the core principles of Islam.',
 'hadith/arbaeen-nawawi.pdf'),

('Riyadh al-Saliheen',
 'Imam al-Nawawi',
 (SELECT id FROM fields WHERE name = 'Arbaeen & Selected Hadith'),
 'beginner',
 'A widely memorised and taught collection of hadith focusing on ethics, manners, and spiritual development.',
 'hadith/riyadh-al-saliheen.pdf');



--── SEERAH ─────────────────────────────────────────────


-- Classical Seerah works

INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Sirat Ibn Hisham',
 'Ibn Hisham',
 (SELECT id FROM fields WHERE name = 'Classical Seerah Works'),
 'advanced',
 'The earliest surviving full biography of the Prophet ﷺ, based on the work of Ibn Ishaq.',
 'seerah/sirat-ibn-hisham.pdf'),

('Al-Bidayah wa al-Nihayah (Seerah Sections)',
 'Ibn Kathir',
 (SELECT id FROM fields WHERE name = 'Classical Seerah Works'),
 'advanced',
 'The seerah portions of Ibn Kathir’s monumental history, integrating hadith authentication with historical narrative.',
 'seerah/bidayah-seerah.pdf');


-- Seerah Summaries

INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Ar-Raheeq al-Makhtum',
 'Safiur Rahman al-Mubarakpuri',
 (SELECT id FROM fields WHERE name = 'Seerah Summaries'),
 'beginner',
 'Award-winning modern seerah biography widely used in Islamic schools and institutes worldwide.',
 'seerah/raheeq-al-makhtum.pdf'),

('Fiqh al-Seerah',
 'Muhammad al-Ghazali',
 (SELECT id FROM fields WHERE name = 'Seerah Summaries'),
 'intermediate',
 'A thematic and reflective study of the Prophet’s life focusing on extracting lessons and principles.',
 'seerah/fiqh-al-seerah.pdf');


-- Shamail (Prophetic Characteristics)


INSERT INTO books (title, author, field_id, level, description, pdf_filename) VALUES

('Al-Shama’il al-Muhammadiyyah',
 'Imam al-Tirmidhi',
 (SELECT id FROM fields WHERE name = 'Shamail (Prophetic Characteristics)'),
 'intermediate',
 'The most famous collection describing the physical characteristics, manners, and lifestyle of the Prophet ﷺ.',
 'seerah/shamail-tirmidhi.pdf');




------------ Author Biography ------------------------------------------------------------------------

UPDATE books SET author_bio = 'Imam Muhammad ibn Abd al-Wahhab (1703–1792) was a scholar from Najd in the Arabian Peninsula. He called Muslims back to pure tawheed based on Quran and Sunnah, and his
  works remain among the most widely studied in Salafi scholarship.'
  WHERE author ILIKE '%ibn Abd al-Wahhab%';

  UPDATE books SET author_bio = 'Imam Ibn Taymiyyah (1263–1328) was a Hanbali scholar from Harran, widely regarded as one of the most influential Islamic scholars in history. He wrote extensively on
  aqeedah, fiqh, and the refutation of innovations, and spent time in prison for his positions.'
  WHERE author ILIKE '%Ibn Taymiyyah%';

  UPDATE books SET author_bio = 'Imam Ibn al-Qayyim al-Jawziyyah (1292–1350) was the foremost student of Ibn Taymiyyah and a prolific Hanbali scholar. He wrote landmark works on aqeedah, tazkiyah,
  fiqh, and the divine names and attributes.'
  WHERE author ILIKE '%Ibn al-Qayyim%';

  UPDATE books SET author_bio = 'Imam al-Nawawi (1233–1277) was a Syrian Shafi''i scholar and one of the most important hadith and fiqh scholars in Islamic history. He is best known for Riyadh
  al-Saliheen, al-Majmu'', and Minhaj al-Talibin.'
  WHERE author ILIKE '%Nawawi%';

  UPDATE books SET author_bio = 'Imam Ibn Qudamah al-Maqdisi (1147–1223) was a Palestinian Hanbali scholar who settled in Damascus. He authored al-Mughni, the most comprehensive work in Hanbali
  jurisprudence, along with many foundational texts in creed and fiqh.'
  WHERE author ILIKE '%Ibn Qudamah%';