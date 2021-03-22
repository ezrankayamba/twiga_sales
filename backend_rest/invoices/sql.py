SQL_INVOICE_ELIGIBLE_SALES = '''
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       Sum(total_value2) AS value_sum,
       Sum(quantity2)    AS quantity_sum
FROM   (SELECT *,
               ( CASE
					WHEN s.aggregate_id IS NOT NULL 
					THEN ( CASE WHEN (SELECT Count(*)
						FROM   sales_aggregatedocument d
							WHERE  d.created_at <=%s AND d.aggregate_sale_id = s.aggregate_id
							AND d.doc_type IN ( 'Exit', 'Assessment' )) = 2 THEN 1 ELSE 0 END )
					ELSE ( CASE WHEN (SELECT Count(*)
                        FROM   sales_document d
							WHERE  d.created_at <= %s AND d.sale_id = s.id
                            AND d.doc_type IN ( 'C2', 'Assessment', 'Exit')) = 3 THEN 1 ELSE 0 END )
                 END ) AS complete
        FROM   sales_sale s
               LEFT JOIN users_agent a
                      ON s.agent_id = a.id
        WHERE  s.invoice_id IS NULL
               AND a.code = %s) AS sales
GROUP  BY complete
'''
