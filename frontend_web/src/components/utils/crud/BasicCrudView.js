import React from "react";
import CrudTable from "./CrudTable";
import PropTypes from "prop-types";

class BasicCrudView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedIds: [],
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleOk = this.handleOk.bind(this);
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleOk() {
    this.setState({ open: false });
    this.props.onDeleteAll({
      ids: this.state.selectedIds,
      cb: () => { },
    });
  }

  render() {
    const { headers, records, title, onSearch, rowClass } = this.props.data;
    const { isLoading, onRowClick, pagination } = this.props;
    let options = this.props.options ? this.props.options : {};

    return (
      <>
        <CrudTable
          title={title}
          columns={headers}
          data={records}
          pagination={pagination}
          isLoading={isLoading}
          options={{
            selection: true,
            ...options,
          }}
          onRowClick={onRowClick}
          onSearch={onSearch}
          rowClass={rowClass}
        />
      </>
    );
  }
}

BasicCrudView.propTypes = {
  name: PropTypes.string,
};
export default BasicCrudView;
