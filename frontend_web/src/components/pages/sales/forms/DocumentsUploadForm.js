import React, { Component } from "react";
import { Modal } from "neza-react-forms";
import { File } from "neza-react-forms";

class DocumentsUploadForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      file: null,
      agent_code: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  doSubmit(e) {
    if (this.state.name) {
      let batch = new FormData();
      batch.append("name", this.state.name);
      batch.append("file", this.state.file);
      batch.append("agent_code", this.state.agent_code);
      this.props.complete(batch);
    } else {
      console.log("Invalid data");
    }
  }

  handleFileSelect(e) {
    let file = e.target.files[0];
    this.setState({ file: file, name: file.name }, () => {
      console.log("State: ", this.state);
    });
  }

  render() {
    const { open, complete, position } = this.props;
    const title = "Upload Documents";
    const media = "application/zip";
    return (
      <Modal
        position={position}
        modalId="fileUpload"
        title={title}
        handleClose={() => complete(false)}
        show={open}
        content={
          <form autoComplete="off" className="mb-2">
            <div className="pt-3">
              <div className="form-group">
                <label htmlFor="agent_code">Agent Code:</label>
                <input
                  value={this.state.agent_code}
                  onChange={this.handleChange}
                  name="agent_code"
                  className="form-control"
                  id="agent_code"
                />
              </div>
              <File
                onChange={this.handleFileSelect}
                name="image"
                label="Select zip file containing documents(.zip)"
                file={this.state.file}
                media={media}
              />
            </div>
          </form>
        }
        footer={
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => complete(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={this.doSubmit.bind(this)}
            >
              Submit
            </button>
          </div>
        }
      />
    );
  }
}

export default DocumentsUploadForm;
