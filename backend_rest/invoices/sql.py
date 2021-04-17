SQL_INVOICE_ELIGIBLE_LIST_RUSUMO = '''
SELECT *,
       ( CASE
           WHEN (SELECT Count(*)
                 FROM   sales_document d
                 WHERE  d.created_at <= %s
                        AND d.sale_id = s.id
                        AND d.doc_type IN ( 'C2', 'Assessment' )) = 2 THEN 1
           ELSE 0
         END ) AS complete
FROM   sales_sale s
       left join users_agent a
              ON s.agent_id = a.id
WHERE  s.invoice_id IS NULL
       AND a.code = %s
       AND complete = 1 
'''

SQL_INVOICE_ELIGIBLE_SUMMARY_RUSUMO = '''
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
                   WHEN (SELECT Count(*)
                         FROM   sales_document d
                         WHERE  d.created_at <= %s
                                AND d.sale_id = s.id
                                AND d.doc_type IN ( 'C2', 'Assessment' )) = 2
                 THEN 1
                   ELSE 0
                 END ) AS complete
        FROM   sales_sale s
               left join users_agent a
                      ON s.agent_id = a.id
        WHERE  s.invoice_id IS NULL
               AND a.code = %s) AS sales
GROUP  BY complete 
'''

SQL_INVOICE_ELIGIBLE_LIST_KABANGA = '''
SELECT *,
       ( CASE
           WHEN (SELECT Count(*)
                 FROM   sales_document d
                 WHERE  d.created_at <= %s
                        AND d.sale_id = s.id
                        AND d.doc_type IN ( 'C2', 'E' )) = 2 and (s.aggregate_id is not null and (SELECT a.category from sales_aggregatesale a where id=s.aggregate_id)=2)
           ELSE 0
         END ) AS complete
FROM   sales_sale s
       left join users_agent a
              ON s.agent_id = a.id
WHERE  s.invoice_id IS NULL
       AND a.code = %s
       AND complete = 1 
'''

SQL_INVOICE_ELIGIBLE_SUMMARY_KABANGA = '''
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
                   WHEN (SELECT Count(*)
                         FROM   sales_document d
                         WHERE  d.created_at <= %s
                                AND d.sale_id = s.id
                                AND d.doc_type IN ( 'C2', 'E' )) = 2 and (s.aggregate_id is not null and (SELECT a.category from sales_aggregatesale a where id=s.aggregate_id)=2)
                 THEN 1
                   ELSE 0
                 END ) AS complete
        FROM   sales_sale s
               left join users_agent a
                      ON s.agent_id = a.id
        WHERE  s.invoice_id IS NULL
               AND a.code = %s) AS sales
GROUP  BY complete
'''
SQL_INVOICE_ELIGIBLE_LIST_KIGOMA = '''
SELECT *,
       ( CASE
           WHEN (s.aggregate_id is not null and (SELECT a.category from sales_aggregatesale a where id=s.aggregate_id)=3) THEN 1
           ELSE 0
         END ) AS complete
FROM   sales_sale s
       left join users_agent a
              ON s.agent_id = a.id
WHERE  s.invoice_id IS NULL
       AND a.code = %s
       AND complete = 1 
'''

SQL_INVOICE_ELIGIBLE_SUMMARY_KIGOMA = '''
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
                   WHEN (s.aggregate_id is not null and (SELECT a.category from sales_aggregatesale a where id=s.aggregate_id)=3)
                 THEN 1
                   ELSE 0
                 END ) AS complete
        FROM   sales_sale s
               left join users_agent a
                      ON s.agent_id = a.id
        WHERE  s.invoice_id IS NULL
               AND a.code = %s) AS sales
GROUP  BY complete 
'''
