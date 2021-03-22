import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FormsHelper } from '../../../../_helpers/FormsHelper';
import CRUD from '../../../../_services/CRUD';
import Modal from '../../../modal/Modal';
import CommonForm from '../../../utils/form/CommonForm';
import CustomerUnAssignedSales from '../tables/CustomerUnAssignedSales';

function SaleDocsFormAggregate({ user, complete, isKigoma }) {
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  useEffect(() => {
    CRUD.list("/aggregate/customers", user.token, {
      onSuccess: (res) => {
        console.log(res)
        let list = res.data.map((c) => {
          return { name: c.customer_name, id: c.customer_name }
        })
        setCustomers(list)
      },
      onFail: (res) => {
        console.error(res)
      }
    })
  }, [])
  const handleSearch = (data) => {
    console.log("Search", data)
    CRUD.search("/aggregate/customers/sales", user.token, data, {
      onSuccess: (res) => {
        console.log(res)
        setSales(res.data.data)
      }
    })
  }
  let date = new Date();
  date.setDate(date.getDate() - 30);
  let searchForm = {
    fields: [
      {
        name: "customer",
        type: "select",
        label: "Customer",
        options: customers,
        validator: FormsHelper.notEmpty("This is required")
      },
      {
        name: "dateFrom",
        type: "date",
        label: "From",
        value: date.toISOString().slice(0, 10)
      },
      {
        name: "dateTo",
        type: "date",
        label: "To",
        value: new Date().toISOString().slice(0, 10)
      }
    ],
    onSubmit: handleSearch,
    btnLabel: "Filter"
  };

  return (
    <Modal
      title={isKigoma ? "DOCS VIA KIGOMA" : "DOCS VIA KABANGA"}
      modalId="saleDocsModal"
      handleClose={() => complete(false)}
      show={true}
      content={
        <div className="sale-docs-aggregate">
          {isKigoma ? <><CommonForm meta={searchForm} className="d-flex" />
            <CustomerUnAssignedSales sales={sales} onCreateAggregate={complete} />
          </> : <p>Comming soon...</p>
          }
        </div>
      }
    />
  );
}

export default connect(
  (state) => {
    return {
      user: state.auth.user,
      loggedIn: state.auth.loggedIn,
      newOptions: state.forms.newOptions,
    };
  },
)(SaleDocsFormAggregate)