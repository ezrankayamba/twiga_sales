import React from 'react';
import { FormsHelper } from '../../../../_helpers/FormsHelper';
import CommonForm from '../../../utils/form/CommonForm';

function SaleDocsFormKigoma({ onUpdate }) {
  let form = {
    fields: [
      {
        name: "quantity2",
        label: "Quantity(Tons) on Assessment",
        validator: FormsHelper.notEmpty(),
      },
      {
        name: "total_value2",
        label: "Value(USD) on Assessment",
        validator: FormsHelper.notEmpty(),
      },
      {
        name: "assessment_doc",
        label: "Assessment Doc",
        type: "file",
        validator: FormsHelper.notEmpty(),
      },
      {
        name: "exit_doc",
        label: "Release Note Doc",
        type: "file",
        validator: FormsHelper.notEmpty(),
      },
    ],
    onSubmit: (data) => onUpdate(data),
    enctype: "multipart/form-data",
    btnLabel: "Update",
    btnClass: "btn-outline-secondary"
  };
  return (
    <div>
      <h5 className="p-2">Aggregate Details & Docs</h5>
      <div className="p-2"><CommonForm meta={form} /></div>
    </div>
  );
}

export default SaleDocsFormKigoma;