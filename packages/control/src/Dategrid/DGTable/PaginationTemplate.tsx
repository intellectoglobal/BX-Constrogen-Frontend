import React from 'react';
import { classNames } from 'primereact/utils';
import { Ripple } from 'primereact/ripple';
import { PAGE_SIZE } from '@igblsln/store';
import {
    PaginatorCurrentPageReportOptions,
    PaginatorRowsPerPageDropdownOptions,
    PaginatorNextPageLinkOptions,
    PaginatorPageLinksOptions,
    PaginatorPrevPageLinkOptions,
} from 'primereact/paginator';
import { Dropdown } from 'primereact/dropdown';

const template = {
    layout: 'PrevPageLink PageLinks NextPageLink RowsPerPageDropdown CurrentPageReport',
    PrevPageLink: (options: PaginatorPrevPageLinkOptions) => {
        return (
            <button type="button" className={classNames(options.className, 'border-round')} onClick={options.onClick} disabled={options.disabled}>
                <span className="p-3">{'<'}</span>
                <Ripple />
            </button>
        );
    },
    NextPageLink: (options: PaginatorNextPageLinkOptions) => {
        return (
            <button type="button" className={classNames(options.className, 'border-round')} onClick={options.onClick} disabled={options.disabled}>
                <span className="p-3">{'>'}</span>
                <Ripple />
            </button>
        );
    },
    PageLinks: (options: PaginatorPageLinksOptions) => {
        if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
            const className = classNames(options.className, { 'p-disabled': true });

            return (
                <span className={className} style={{ userSelect: 'none' }}>
                    ...
                </span>
            );
        }

        return (
            <button type="button" className={options.className} onClick={options.onClick}>
                {options.page + 1}
                <Ripple />
            </button>
        );
    },
    RowsPerPageDropdown: (options: PaginatorRowsPerPageDropdownOptions) => {
        const dropdownOptions = [
            { label: PAGE_SIZE, value: PAGE_SIZE },
            { label: PAGE_SIZE + 5, value: PAGE_SIZE + 5 },
            { label: PAGE_SIZE + 10, value: PAGE_SIZE + 10 },

        ];

        return <> Rows Per Page <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />;</>
    },
    CurrentPageReport: (options: PaginatorCurrentPageReportOptions) => {
        return (
            <span style={{ color: 'var(--text-color)', userSelect: 'none', marginLeft: 40, textAlign: 'center' }}>
                Showing {options.first} - {options.last} of {options.totalRecords}
            </span>
        );
    }
};

export default template

