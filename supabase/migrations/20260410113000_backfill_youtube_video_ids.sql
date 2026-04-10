WITH extracted AS (
  SELECT
    id,
    NULLIF(
      (
        regexp_match(
          COALESCE(video_url, ''),
          '(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:embed/|v/|watch\?v=|watch\?.+&v=|shorts/|live/)|studio\.youtube\.com/video/)([\w-]{11})',
          'i'
        )
      )[1],
      ''
    ) AS extracted_video_id
  FROM public.content
)
UPDATE public.content AS content
SET
  youtube_video_id = COALESCE(extracted.extracted_video_id, content.youtube_video_id),
  source_platform = CASE
    WHEN COALESCE(extracted.extracted_video_id, content.youtube_video_id) IS NOT NULL THEN 'youtube'
    WHEN NULLIF(BTRIM(content.video_url), '') IS NOT NULL THEN 'external'
    ELSE content.source_platform
  END,
  thumbnail_url = CASE
    WHEN NULLIF(BTRIM(content.thumbnail_url), '') IS NULL
      AND COALESCE(extracted.extracted_video_id, content.youtube_video_id) IS NOT NULL
    THEN FORMAT(
      'https://img.youtube.com/vi/%s/hqdefault.jpg',
      COALESCE(extracted.extracted_video_id, content.youtube_video_id)
    )
    ELSE content.thumbnail_url
  END
FROM extracted
WHERE content.id = extracted.id
  AND (
    COALESCE(extracted.extracted_video_id, '') <> COALESCE(content.youtube_video_id, '')
    OR CASE
      WHEN COALESCE(extracted.extracted_video_id, content.youtube_video_id) IS NOT NULL THEN 'youtube'
      WHEN NULLIF(BTRIM(content.video_url), '') IS NOT NULL THEN 'external'
      ELSE content.source_platform
    END <> content.source_platform
    OR (
      NULLIF(BTRIM(content.thumbnail_url), '') IS NULL
      AND COALESCE(extracted.extracted_video_id, content.youtube_video_id) IS NOT NULL
    )
  );
