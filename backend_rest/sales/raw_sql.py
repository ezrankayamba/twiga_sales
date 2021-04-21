SQL_SUMMARY_PER_DEST = '''
SELECT Max(id)          AS id,
       destination,
       complete,
       Count(id)        AS volume,
       Sum(total_value) AS value_sum,
       Sum(quantity)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
                   WHEN (SELECT Count(*)
                         FROM   sales_document d
                         WHERE  d.sale_id = s.id) = 3 THEN 1
                   ELSE 0
                 END ) AS complete
        FROM   sales_sale s) AS sales
WHERE sales.transaction_date >= %s and sales.transaction_date <= %s
GROUP  BY destination, complete 
'''

SQL_SUMMARY_PER_DEST_NO_FILTER = '''
SELECT Max(id)          AS id,
       destination,
       complete,
       Count(id)        AS volume,
       Sum(total_value) AS value_sum,
       Sum(quantity)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
                   WHEN (SELECT Count(*)
                         FROM   sales_document d
                         WHERE  d.sale_id = s.id) = 3 THEN 1
                   ELSE 0
                 END ) AS complete
        FROM   sales_sale s) AS sales
GROUP  BY destination, complete 
'''
