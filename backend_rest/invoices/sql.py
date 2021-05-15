from django.db import connection

SQL_ALL_DOCS = '''
SELECT row_number() OVER (ORDER BY aggregate_sale_id) AS id, id as org_id, ref_number, description, doc_type, file, created_at, updated_at,user_id,aggregate_sale_id,sale_id,sales_order,transaction_date,destination, truck
FROM(
SELECT id, ref_number, description, doc_type, file, created_at, updated_at,user_id,aggregate_sale_id,sale_id,sales_order,transaction_date,destination, truck
FROM (SELECT d.*,s.sales_order,s.transaction_date,s.destination, (select NULL) as aggregate_sale_id from sales_document d left join sales_sale s on d.sale_id=s.id and s.aggregate_id is NULL)
UNION
select aggr_docs.*, s.id as sale_id, s.sales_order, s.transaction_date, s.destination, (select NULL) as truck
FROM sales_sale s left JOIN
(select d.* from sales_aggregatedocument d LEFT join sales_aggregatesale aggr on d.aggregate_sale_id=aggr.id) as aggr_docs 
on s.aggregate_id=aggr_docs.aggregate_sale_id
WHERE s.aggregate_id is not NULL
) as d
'''


def change_docs_db_view():
    with connection.cursor() as cursor:
        cursor.execute("DROP VIEW IF EXISTS vw_sale_documents")
        cursor.execute(f"CREATE VIEW vw_sale_documents AS {SQL_ALL_DOCS}")


def rusumo_list_query(for_summary=True):
    part1 = f'''
       select s.*,a.code as agent_code,
       (CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'C2', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
       FROM sales_sale as s
       left join users_agent a on s.agent_id=a.id or s.agent_id is null
       WHERE s.destination like 'RWANDA%%'
       and s.transaction_date < %s
       and s.invoice_id is null
       and agent_code = %s
       and s.task_id is null
       '''
    if for_summary:
        return part1
    return f'{part1} and complete = 1'


def kigoma_list_query(for_summary=True):
    part1 = f'''
       select s.*,a.code as agent_code, aggr.category,
	(CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'Exit', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
	FROM sales_sale as s
	left join users_agent a on (s.agent_id=a.id or s.agent_id is null)
	left join sales_aggregatesale aggr on s.aggregate_id=aggr.id
	WHERE (s.destination like 'CONGO%%' or s.destination like 'BURUNDI%%')
	and s.transaction_date < %s
	and s.invoice_id is null
	and agent_code = %s
	and (aggr.category=3 or aggr.category is null)
       and s.task_id is null
       '''
    if for_summary:
        return part1
    return f'{part1} and complete = 1'


def kabanga_list_query(for_summary=True):
    part1 = f'''
       select s.*,a.code as agent_code, aggr.category,
	(CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'C2', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
	FROM sales_sale as s
	left join users_agent a on (s.agent_id=a.id or s.agent_id is null)
	left join sales_aggregatesale aggr on s.aggregate_id=aggr.id
	WHERE s.destination like 'BURUNDI%%'
	and s.transaction_date < %s
	and s.invoice_id is null
	and agent_code = %s
	and (aggr.category=2 or aggr.category is null)
       and s.task_id is null
       '''
    if for_summary:
        return part1
    return f'{part1} and complete = 1'


def summary_query(category):
    list_query = None
    lookup = {
        'rusumo': rusumo_list_query,
        'kigoma': kigoma_list_query,
        'kabanga': kabanga_list_query,
    }
    list_query = lookup[category]
    return f'''
              SELECT Max(id)           AS id,
                     complete,
                     Count(id)         AS volume,
                     SUM(total_value2) AS value_sum,
                     SUM(quantity2)    AS quantity_sum
              FROM 
              ({list_query()})
              GROUP BY complete
              '''
