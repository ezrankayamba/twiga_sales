-- List eligible Rusumo & Rusumo Aggregate

select *,
(select count(*) from (
	select ref_number from sales_document d where d.sale_id=s.id
	UNION
	select ref_number from sales_aggregatedocument d LEFT JOIN sales_aggregatesale aggr on d.aggregate_sale_id=aggr.id where s.aggregate_id=aggr.id)
) as num_docs
from sales_sale s
where invoice_id is null 
and destination like 'RWANDA%' 
and num_docs>=3




-- All Documents
DROP VIEW IF EXISTS vw_sale_documents;

CREATE VIEW vw_sale_documents
AS
SELECT id, ref_number, description, doc_type, file, created_at, updated_at,user_id,aggregate_sale_id,sale_id,sales_order,transaction_date,destination, truck
FROM (SELECT d.*,s.sales_order,s.transaction_date,s.destination, (select NULL) as aggregate_sale_id from sales_document d left join sales_sale s on d.sale_id=s.id and s.aggregate_id is NULL)
UNION
select aggr_docs.*, s.id as sale_id, s.sales_order, s.transaction_date, s.destination, (select NULL) as truck
FROM sales_sale s left JOIN
(select d.* from sales_aggregatedocument d LEFT join sales_aggregatesale aggr on d.aggregate_sale_id=aggr.id) as aggr_docs 
on s.aggregate_id=aggr_docs.aggregate_sale_id
WHERE s.aggregate_id is not NULL


-- On/Deleted documents
DROP VIEW IF EXISTS vw_on_or_deleted_documents;
CREATE VIEW vw_on_or_deleted_documents
AS
SELECT m.*, s.destination
from makerchecker_task m
left join makerchecker_tasktype t on m.task_type_id=t.id
left join sales_document d on m.reference=d.id
left JOIN sales_sale s on d.sale_id=s.id
where t.name='Sales Documents Delete'


-- Using View
select s.*,
(select count(*) from vw_sale_documents where sale_id=s.id) as num_docs
FROM sales_sale as s
WHERE s.destination like 'RWANDA%'
and s.invoice_id is null
and num_docs>=3





-- OTHERS


select s.*,
(select count(*) from vw_sale_documents where sale_id=s.id) as num_docs
FROM sales_sale as s
WHERE s.destination like 'RWANDA%'
and s.invoice_id is null
and transaction_date>='2021-04-01'
-- and num_docs>=2
and s.id not in ('15012','15004','14998','14997','14993','14992','14991','14990','14988','14987','14986','14985','14984','14983','14982','14979','14978','14972','14971','14965','14963','14962','14960','14959','14958','14957','14956','14954','14952','14950','14949','14948','14947','14946','14944','14943','14942','14941','14940','14939','14937','14936','14935','14934','14933','14932','14931','14930','14929','14928','14927','14926','14925','14924','14923','14922','14921','14920','14919','14917','14916','14915','14914','14913','14912','14910','14909','14908','14907','14906','14905','14904','14903','14902','14899','14898','14897','14896','14895','14894','14893','14892','14891','14890','14889','14888','14887','14886','14881','14880','14879','14878','14877','14875','14874','14873','14872','14871','14870','14869','14868','14867','14866','14865','14864','14863','14861','14860','14859','14856','14855','14853','14852','14851','14849','14848','14847','14846','14845','14844','14843','14842','14841','14840','14839','14838','14837','14836','14835','14834','14833','14829','14828','14827','14826','14825','14824','14823','14821','14820','14819','14818','14817','14816','14815','14814','14813','14812','14811','14809','14808','14807','14806','14804','14803','14802','14801','14800','14799','14798','14797','14796','14794','14793','14791','14790','14789','14788','14786','14785','14784','14783','14782','14781','14780','14778','14777','14776','14775','14773','14772','14770','14768','14767','14766','14765','14764','14762','14757','14756','14755','14754','14752','14751','14750','14748','14746','14745','14744','14743','14742','14741','14740','14739','14738','14737','14735','14734','14733','14732','14731','14729','14728','14727','14726','14725','14724','14723','14721','14720','14719','14718','14717','14715','14714','14711','14709','14707','14706','14704','14703','14702','14701','14698','14697','14696','14695','14694','14693','14692','14691','14690','14689','14688','14683','14682','14681','14679','14678','14677','14676','14675','14674','14671','14670','14667','14666','14665','14662','14661','14660','14659','14658','14657','14656','14654','14653','14652','14651','14650','14649','14648','14646','14645','14644','14643','14642','14641','14639','14638','14636','14635','14632','14631','14630','14629','14628','14627','14626','14625','14624','14622','14621','14620','14619','14618','14617','14616','14615','14614','14611','14610','14609','14607','14603','14602','14601','14600','14599','14597','14596','14595','14594','14593','14590','14589','14587','14582','14581','14580','14579','14576','14575','14574','14573','14572','14571','14567','14566','14564','14563','14562','14561','14560','14559','14557','14556','14555','14554','14549','14548','14547','14546','14544','14543','14542','14541','14540','14539','14538','14537','14535','14534','14533','14532','14531','14529','14528','14527','14526','14525','14524','14523','14522','14521','14519','14518','14517','14516','14515','14514','14513','14512','14511','14510','14508','14507','14506','14505','14504','14503','14502','14501','14500','14499','14498','14497','14495','14494','14491','14489','14488','14484','14483','14482','14481','14480','14479','14478','14476','14475','14474','14473','14472','14471','14467','14466','14465','14464','14462','14461','14458','14457','14456','14453','14452','14450','14448','14447','14446','14445','14444','14441','14440','14439','14438','14437','14436','14435','14433','14432','14431','14430','14429','14426','14425','14424','14423','14420','14419','14418','14416','14415','14414','14413','14412','14411','14410','14409','14408','14407','14406','14405','14404','14403','14401','14400','14397','14396','14395','14394','14393','14391','14390','14388','14386','14385','14384','14383','14382','14380','14378','14376','14375','14373','14372','14371','14370','14369','14367','14366','14365','14364','14362','14361','14360','14359','14358','14357','14356','14355','14354','14353','14352','14351','14350','14349','14348','14347','14346','14345','14344','14343','14342','14341','14340','14339','14338','14337','14336','14332','14331','14330','14329','14328','14326','14325','14324','14322','14320','14318','14317','14316','14315','14314','14313','14312','14311','14310','14309','14308','14307','14306','14305','14304','14302','14301','14300','14298','14296','14295','14294','14293','14292','14291','14289','14288','14287','14283','14282','14281','14280','14279','14278','14277','14275','14274','14273','14272','14271','14269','14268','14267','14264','14263','14262')
order by s.id


select d.*, s.sales_order, s.destination, s.customer_name, m.status, s.transaction_date
from sales_document d 
left join sales_sale s on d.sale_id=s.id
left join makerchecker_task m on d.id=m.reference
where 1=1
-- and s.transaction_date>='2021-04-01' and transaction_date <='2021-05-01'
order by m.status


SELECT * from sales_sale s
where s.transaction_date>='2021-04-01' and transaction_date <='2021-05-01'
order by s.transaction_date


-- Invoiceable Summary RWANDA
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM 
(
	select s.*,a.code as agent_code,
	(CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'C2', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
	FROM sales_sale as s
	left join users_agent a on s.agent_id=a.id or s.agent_id is null
	WHERE s.destination like 'RWANDA%'
	and s.transaction_date<'2021-05-01'
	and s.invoice_id is null
	and agent_code = '101-815-579'
	order by complete
)
GROUP BY complete


-- Invoiceable KIGOMA
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM 
(
	select s.*,a.code as agent_code, aggr.category,
	(CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'Exit', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
	FROM sales_sale as s
	left join users_agent a on (s.agent_id=a.id or s.agent_id is null)
	left join sales_aggregatesale aggr on s.aggregate_id=aggr.id
	WHERE (s.destination like 'CONGO%' or s.destination like 'BURUNDI%')
	and s.transaction_date<'2021-05-01'
	and s.invoice_id is null
	and agent_code = '101-815-579'
	and (aggr.category=3 or aggr.category is null)
	order by category
)
GROUP BY complete


-- Invoicable KABANGA
SELECT Max(id)           AS id,
       complete,
       Count(id)         AS volume,
       SUM(total_value2) AS value_sum,
       SUM(quantity2)    AS quantity_sum
FROM 
(
	select s.*,a.code as agent_code, aggr.category,
	(CASE WHEN (select count(*) from vw_sale_documents d where sale_id=s.id and d.doc_type IN ( 'C2', 'Assessment' )) >=2 THEN 1 ELSE 0 END) as complete
	FROM sales_sale as s
	left join users_agent a on (s.agent_id=a.id or s.agent_id is null)
	left join sales_aggregatesale aggr on s.aggregate_id=aggr.id
	WHERE s.destination like 'BURUNDI%'
	and s.transaction_date<'2021-05-01'
	and s.invoice_id is null
	and agent_code = '101-815-579'
	and (aggr.category=2 or aggr.category is null)
	order by category
)
GROUP BY complete


