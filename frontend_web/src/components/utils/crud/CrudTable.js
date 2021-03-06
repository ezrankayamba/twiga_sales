import React from "react";
import Pagination from "../pagination/Pagination";
import LoadingIndicator from "../loading/LoadingIndicator";
import CommonForm from "../form/CommonForm";
import CloseableModel from "../../modal/ClosableModal";
import { SearchForm } from "../search/SearchForm";

class CrudTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      columns,
      data,
      onRowClick,
      isLoading,
      newRecord,
      pagination,
      onSearch,
      rowClass
    } = this.props;
    let pages = 1;
    let pageNo = 1;
    let numRecords = 0;
    let onPageChange = console.log("Not implemented");
    onPageChange = console.log;
    if (pagination) {
      pages = pagination.pages;
      pageNo = pagination.pageNo;
      onPageChange = pagination.onPageChange;
      numRecords = pagination.numRecords;
    }
    console.log(rowClass);
    let form = {
      title: "Add Record",
      fields: [
        ...columns
          .filter((col) => !col.render)
          .map((col) => {
            return {
              name: col.field,
              label: col.title,
              validator: col.validator,
            };
          }),
      ],
      onSubmit: newRecord && newRecord.onAdd,
    };
    const searchFields = columns.filter((c) => c.search);

    return (
      <div className="p-2">
        {searchFields.length > 0 && (
          <SearchForm onSearch={onSearch} searchFields={searchFields} />
        )}
        {pagination && pages >= 1 && (
          <Pagination
            pageNo={pageNo}
            pages={pages}
            numRecords={numRecords}
            onPageChange={onPageChange}
          />
        )}
        <div className="table-scrollable">
          <table className="table table-sm table-hover table-bordered mb-0">
            <thead className="border-none">
              <tr className="border-none">
                {columns.map(
                  (col) =>
                    col.type !== "hidden" && (
                      <th key={col.field}>{col.title}</th>
                    )
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  onClick={onRowClick ? (e) => onRowClick(e, row) : null}
                  key={row.id}
                  className={`border-none ${rowClass ? rowClass(row) : ""}`}
                >
                  {columns.map(
                    (col) =>
                      col.type !== "hidden" && (
                        <td className="p-1" key={col.field}>
                          {col.render ? col.render(row) : row[col.field]}
                        </td>
                      )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <LoadingIndicator />}

        {newRecord && (
          <CloseableModel
            modalId="manageRecord"
            handleClose={newRecord.hide}
            show={newRecord.open}
            content={<CommonForm meta={form} onClose={newRecord.hide} />}
          />
        )}
      </div>
    );
  }
}

export default CrudTable;
