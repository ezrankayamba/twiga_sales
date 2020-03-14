import React, {Component} from 'react';
import {IconFirst, IconLast, IconNext, IconPrev} from "./Incons";

class Pagination extends Component {
    render() {
        const {pageNo, pages, onPageChange} = this.props
        let pList = []
        let from = pageNo - 2 > 1 ? pageNo - 2 : 1
        let to = from + 5 < pages ? from + 5 : pages
        for (let i = from; i <= to; i++) {
            pList.push(i)
        }
        return (
            <div className="pagination mt-2">
                <div className="btn-group">
                    {pageNo > 1 && <>
                        <button className="btn btn-sm btn-outline-secondary"
                                onClick={() => onPageChange(1)}><IconFirst/>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary"
                                onClick={() => onPageChange(pageNo - 1)}><IconPrev/>
                        </button>
                    </>}
                    {pList.map(p => <button key={p}
                                            className={`${p === pageNo ? 'active ' : ''}btn btn-sm btn-outline-secondary`}
                                            onClick={() => onPageChange(p)}>{p}</button>)}
                    {pageNo !== pages && <>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => onPageChange(pageNo + 1)}>
                            <IconNext/>
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => onPageChange(pages)}>
                            <IconLast/></button>
                    </>}
                </div>
            </div>
        );
    }
}

export default Pagination;
