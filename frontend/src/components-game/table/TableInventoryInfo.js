import './table.scss';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import {
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';

import { Checkbox } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import imgAncien from '../../assets-game/ancien.webp';
import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
import BonusBar from '../bonus/BonusBar';
import BonusView from '../bonus/BonusView';

export default function TableInventoryInfo(props) {

    const [currentInventory, setCurrentInventory] = useState(props.currentInventory)
    useEffect(() => { setCurrentInventory(props.currentInventory) }, [props.currentInventory])
    const [reload, setReload] = useState(props.reload)
    useEffect(() => { setReload(props.reload) }, [props.reload])

    //GET DATA
    useEffect(() => {
        getInventoryListings();
    }, [reload]);

    //API
    const getInventoryListings = async () => {
        setReady(false)

        axios.post('/api/m1/marketplaceInventory/getTotalListing', {
            address: props.walletAccount,
            type: currentInventory.inventoryType,
            id: currentInventory.inventoryId,
            level: currentInventory.inventoryLevel
        }
        )
            .then(response => {

                response.data.success ?
                    [setData(response.data.data.listings), setReady(true), setListData(response.data.data.listings.map((data) => ({ ...data, isChecked: false })))]
                    : null
                setCheckedList([]);
            })
            .catch(error => {
                console.warn(error)
            })
    }

    const [data, setData] = useState([]);
    const [listData, setListData] = useState([])
    const [checkedList, setCheckedList] = useState([]);

    const onListCheck = (currentId) => {
        setListData(listData.map((row) => (row.id === currentId ? { ...row, isChecked: !row.isChecked } : row)))
    }

    const getIsChecked = (currentId) => {
        for (let i = 0; i < listData.length; i++) {
            if (listData[i].id == currentId) return listData[i].isChecked
        }
    }

    useEffect(() => {
        setCheckedList(listData.filter((row) => (row.isChecked)))
    }, [listData]);

    useEffect(() => {
        props.callback_visibleButton(checkedList.length > 0)
        props.callback_buyCartData(checkedList)
    }, [checkedList]);

    const [ready, setReady] = useState(false);

    //Check Windows Size
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 768px)").matches
    )
    useEffect(() => {
        window
            .matchMedia("(min-width: 768px)")
            .addEventListener('change', e => setMatches(e.matches));
        // console.log('Window is Desktop? ', matches)
    }, [matches]);

    //Custom Cell: Image
    const ImgCell = ({ row }) => {
        console.log(row)
        return <div className='mrkt-res'>
            {row.values.inventoryType == 'tool' && <>
                <BonusBar info={row.values.bonuses} />
                <BonusView info={row.values.bonuses} />
            </>}
            <img src={row.values.image} />
        </div>
    }

    //Columns
    const columns = useMemo(
        () => [
            {
                Header: 'ID',
                accessor: 'id',
                isVisible: false
            },
            {
                Header: 'Status',
                accessor: 'status',
                isVisible: false
            },
            {
                Header: 'Type',
                accessor: 'inventoryType',
                isVisible: false
            },
            {
                Header: 'Market',
                accessor: 'market',
                isVisible: false
            },
            {
                Header: 'Check',
                accessor: 'isChecked',
                isVisible: false
            },
            {
                Header: '',
                accessor: 'image',
                Cell: ImgCell,
                isVisible: true
            },
            {
                Header: '',
                accessor: 'bonuses',
                isVisible: false
            },
            {
                Header: 'Name',
                accessor: 'name',
                isVisible: true
            },
            {
                Header: 'Qt',
                accessor: 'quantity',
                filter: 'numericSmallerThan',
                isVisible: true
            },
            {
                Header: 'P/U',
                accessor: 'price',
                filter: 'numericSmallerThan',
                isVisible: matches
            },
            {
                Header: 'Total',
                accessor: 'totalPrice',
                filter: 'numericSmallerThan',
                isVisible: true
            },
            {
                Header: 'Expire',
                accessor: 'endingTime',
                isVisible: matches
            },
        ],
        []
    );

    const numericSmallerThanFilter = useCallback((rows, id, filterValue) =>
        rows.filter(row => row.values[id] <= filterValue), [])

    const filterTypes = useMemo(() => ({
        // use filter key from columns to filter this value.
        // alternately, you could use "between" key,
        // but then you would have to set the filter as
        // setFilter(selected, [Number.MIN_SAFE_INTEGER, e.target.value]) in the <input/>'s onChange which could be a pain to handle.
        numericSmallerThan: numericSmallerThanFilter,
    }), [numericSmallerThanFilter]);

    //useTable Init
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        setHiddenColumns,
        canPreviousPage,
        canNextPage,
        pageOptions,
        nextPage,
        previousPage,
        state: { pageIndex },
        setFilter,
        setSortBy,

    } = useTable(
        {
            columns,
            data,
            initialState: { pageSize: 10 },
            filterTypes
        },

        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    //Hidden Columns
    useEffect(() => {
        setHiddenColumns(
            columns.filter(column => !column.isVisible).map(column => column.accessor)
        );
    }, [setHiddenColumns, columns]);

    //Render
    return (
        <>
            {
                ready
                    ? <>
                        <table {...getTableProps()} className="marketplace-table">
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            (column.id == 'price') ?
                                                <th {...column.getHeaderProps(column.getSortByToggleProps())} className='th-price'>
                                                    P/U <img src={imgAncien} />
                                                </th>
                                                : (column.id == 'totalPrice') ?
                                                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className='th-price'>
                                                        Total <img src={imgAncien} />
                                                    </th>
                                                    :
                                                    <th {...column.getHeaderProps()}>
                                                        {column.render('Header')}
                                                    </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {page.map((row, i) => {
                                    prepareRow(row);

                                    return (
                                        <tr key={row.values.id} id={row.values.id} {...row.getRowProps()}
                                            className={
                                                row.values.status == 0 ? 'canceled'
                                                    : row.values.status == 1 ? 'onsale'
                                                        : row.values.status == 2 ? 'sold'
                                                            : row.values.status == 3 ? 'expired'
                                                                : 'error'}>

                                            {row.cells.map(cell => {

                                                //Time > Expired Cell
                                                if (
                                                    cell.column.id == 'endingTime'
                                                    && (cell.row.values.status == 0)
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()} className='cell-expired'>{
                                                        'Expired'
                                                    }</td>;

                                                    //Time > OnSale Cell
                                                } else if (
                                                    cell.column.id == 'endingTime'
                                                    && (cell.row.values.status == 1)
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()} className='cell-onsale'>{
                                                        getShortData(cell.value)
                                                    }</td>;

                                                    //Time > Sold Cell
                                                } else if (
                                                    cell.column.id == 'endingTime'
                                                    && (cell.row.values.status == 2)
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()} className='cell-sold'>{
                                                        'Sold'
                                                    }</td>;

                                                    //Time > Canceled Cell
                                                } else if (
                                                    cell.column.id == 'endingTime'
                                                    && (cell.row.values.status == 3)
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()} className='cell-canceled'>{
                                                        'Canceled'
                                                    }</td>;

                                                    //Type > Resource Image
                                                } else if (
                                                    cell.column.id == 'image'
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()}>
                                                        <div
                                                            className='cell-chk-img'
                                                            onClick={(e) => {
                                                                if (row.values.inventoryType != 'tool' || e.target.className === 'bonus-view') {
                                                                    onListCheck(row.values.id)
                                                                }
                                                            }}>
                                                            <Checkbox
                                                                checked={getIsChecked(row.values.id)}
                                                                className='mrkt-check'
                                                            />
                                                            <div className='mrkt-res'>
                                                                <img src={
                                                                    row.values.type == 2
                                                                        ? imgWood
                                                                        : row.values.type == 3
                                                                            ? imgStone
                                                                            : cell.value
                                                                } />
                                                            </div>
                                                            {row.values.inventoryType == 'tool' && <BonusView icon={true} info={row.values.bonuses} />}
                                                            {row.values.inventoryType == 'tool' && <BonusBar info={row.values.bonuses} />}
                                                        </div>
                                                    </td>;

                                                    //Type > Quantity/Total
                                                } else if (cell.column.id == 'name') {
                                                    return <td key={cell.value} {...cell.getCellProps()} className='tool-name-bonus-cell'>
                                                        <div className='inventory-name'>
                                                            {cell.value}
                                                        </div>
                                                        {/* {row.values.inventoryType == 'tool' && <BonusBar info={row.values.bonuses} />} */}
                                                    </td>;

                                                    //Normal Cell
                                                } else if (
                                                    cell.column.id == 'Qt' || cell.column.Header == 'Total'
                                                ) {
                                                    return <td key={cell.value} {...cell.getCellProps()}>{
                                                        format(cell.value)
                                                    }</td>;

                                                    //Normal Cell
                                                } else {
                                                    return <td key={cell.value} {...cell.getCellProps()}>{
                                                        cell.render('Cell')
                                                    }</td>;

                                                }
                                            })}

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="pagination">
                            <img
                                src={iconBack}
                                className={!canPreviousPage ? 'back-page page-disabled' : 'next-page'}
                                disabled={!canPreviousPage}
                                onClick={() => { previousPage() }}
                            />
                            <img
                                src={iconForward}
                                className={!canNextPage ? 'next-page page-disabled' : 'next-page'}
                                disabled={!canNextPage}
                                onClick={() => { nextPage() }}
                            />
                        </div>
                    </>
                    : <CircularProgress size={50} sx={{ color: "gold", padding: "30px" }} />
            }
        </>
    );

    function getShortData(data) {
        let shortData = data;

        if (shortData) {
            shortData = new Date(shortData);
            shortData = shortData.toString();
            shortData =
                '(' +
                shortData.split(' ')[1] + ' '
                + shortData.split(' ')[2] + ') '
                + shortData.split(' ')[4].split(':')[0] + ':'
                + shortData.split(' ')[4].split(':')[1]
        }

        return shortData
    }

    function format(x) {
        let newValue = x;

        newValue
            && (newValue = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

        return newValue
    }

}