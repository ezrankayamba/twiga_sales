import React, { useState } from 'react';
import CommonForm from '../../../utils/form/CommonForm';

function DocumentsFormCombinex({ meta, readOnly, onClose, newOptions, clearNewOption }) {
    const [active, setActive] = useState('tab1')
    let noc2Flds = () => {
        let tmp = meta.fields.map((f) => {
            if (f.name !== "c2_doc") {
                return f
            }

            return { ...f, readOnly: true, validator: null }
        })
        return [...tmp, {
            name: "missing_c2",
            value: 1,
            type: "hidden",
        }]
    }
    const noC2Meta = {
        ...meta,
        fields: noc2Flds()
    }
    return (
        <div className="tabs">
            <div className="tab-header tab-buttons">
                <button className={`${active === 'tab1' ? "btn-active" : ""}`} onClick={() => setActive("tab1")}>ATTACH WITH C2</button>
                <button className={`${active === 'tab2' ? "btn-active" : ""}`} onClick={() => setActive("tab2")}>WITHOUT C2</button>
            </div>
            {active === 'tab1' && <div className="tab-content">
                <CommonForm
                    meta={meta}
                    readOnly={readOnly}
                    onClose={onClose}

                />
            </div>}
            {active === 'tab2' && <div className="tab-content">
                <CommonForm
                    meta={noC2Meta}
                    readOnly={readOnly}
                    onClose={onClose}

                />
            </div>}
        </div>
    );
}

export default DocumentsFormCombinex;