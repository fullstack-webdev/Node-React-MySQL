import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useTable,
  usePagination,
  useSortBy,
  useGlobalFilter,
  useFilters
} from 'react-table';
import './table.scss'

import mrktAgain from '../../assets-game/mrktAgain.svg';
import mrktCancel from '../../assets-game/mrktCancel.svg';
import mrktRemove from '../../assets-game/mrktRemove.svg';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';

import imgAncien from '../../assets-game/ancien.webp';
import imgWood from '../../assets-game/wood.webp';
import imgStone from '../../assets-game/stone.webp';

export default function TableProfile( props ) {

  //Set data as State and Handle Changes
  const [value, setValue] = useState(props.data);
  useEffect(() => { setValue(props.data) }, [props.data]);

  //Callback Again Button
  const sellAgain = (type, quantity, price, time) => {
    props.callback_sellAgain(type, quantity, price, time)
  }

  //Check Windows Size
  const [matches, setMatches] = useState(
    window.matchMedia("(min-width: 768px)").matches
  )
  useEffect(() => {
    window
    .matchMedia("(min-width: 768px)")
    .addEventListener('change', e => setMatches( e.matches ));
    // console.log('Window is Desktop? ', matches)
  }, [matches]);



  //Custom Cell: Refresh
  const RefreshCell = ({ row }) => {
    return <img 
      src={mrktAgain} 
      className='mrkt-icon again'
      onClick={() => 
        sellAgain(
          row.values.type,
          row.values.quantity,
          row.values.price,
          row.values.time,
        )
      }
    />
  }
  //Custom Cell: Delete
  const DeleteCell = ({ row }) => {
    if(row.values.status == 0 || row.values.status == 2 || row.values.status == 3){
      return <img src={mrktRemove} className='mrkt-icon remove'
        onClick={() => props.callback_remove(row.values.id)}
      />
    }

    else if(row.values.status == 1){
      return <img src={mrktCancel} className='mrkt-icon cancel'
        onClick={() => props.callback_cancel(row.values.id)}
      />
    }

    else { return null }  
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
        accessor: 'type',
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
        isVisible: true
      },
      {
        Header: '',
        accessor: "refreshButton",
        Cell: RefreshCell,
        isVisible: true 
      },
      {
        Header: '',
        accessor: "deleteButton",
        Cell: DeleteCell,
        isVisible: true 
      }

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
      data: value,
      initialState: { pageSize: 6 },
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

  //Filter
  const [filterSelect, setFilterSelect] = useState('type');



  //Render
  return (
    <>
      <table {...getTableProps()} className="marketplace-table">
        <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              (column.id == 'price') ?
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className='th-price'>
                  P/U <img src={imgAncien}/>
                </th>
              : (column.id == 'totalPrice') ?
              <th {...column.getHeaderProps(column.getSortByToggleProps())} className='th-price'>
                Total <img src={imgAncien}/>
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
              <tr id={row.values.id} key={row.values.id} {...row.getRowProps()}
                  className={
                    row.values.status == 0 ? 'canceled'
                      : row.values.status == 1 ? 'onsale'
                        : row.values.status == 2 ? 'sold'
                          : row.values.status == 3 ? 'expired'
                            : 'error' }>

                {row.cells.map(cell => {

                  //Time > Expired Cell
                  if(
                    cell.column.id == 'endingTime' 
                    && (cell.row.values.status == 0)
                  ){
                    return <td {...cell.getCellProps()} className='cell-expired'>{
                      'Expired'
                    }</td>;

                  //Time > OnSale Cell
                  }else if(
                    cell.column.id == 'endingTime' 
                    && (cell.row.values.status == 1)
                  ){
                    return <td {...cell.getCellProps()} className='cell-onsale'>{
                      getShortData(cell.value)
                  }</td>;

                  //Time > Sold Cell
                  }else if(
                    cell.column.id == 'endingTime' 
                    && (cell.row.values.status == 2)
                  ){
                    return <td {...cell.getCellProps()} className='cell-sold'>{
                      'Sold'
                    }</td>;

                  //Time > Canceled Cell
                  }else if(
                    cell.column.id == 'endingTime' 
                    && (cell.row.values.status == 3)
                  ){
                    return <td {...cell.getCellProps()} className='cell-canceled'>{
                      'Canceled'
                    }</td>;

                  //Type > Resource Image
                  }else if(
                    cell.column.id == 'type' 
                  ){
                    return <td {...cell.getCellProps()}>{
                      <img src={
                        cell.value == 2
                          ? imgWood
                          : cell.value == 3
                            ? imgStone
                            : false
                      } className='mrkt-res'/>
                    }</td>;

                  //Type > Quantity/Total
                  }else if(
                    cell.column.id == 'refreshButton' || cell.column.id == 'deleteButton'
                  ){
                    return <td {...cell.getCellProps()} className='actionButton'>{
                        cell.render('Cell')
                    }</td>;

                  //Type > Quantity/Total
                  }else if(
                    cell.column.id == 'Qt' || cell.column.Header == 'Total'
                  ){
                    return <td {...cell.getCellProps()}>{
                        format(cell.value)
                    }</td>;

                  //Normal Cell
                  }else{
                    return <td {...cell.getCellProps()}>{
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
          onClick={() => {previousPage()} }
        />

        <img 
          src={iconForward}
          className={!canNextPage ? 'next-page page-disabled' : 'next-page'}
          disabled={!canNextPage}
          onClick={() => {nextPage()}}
        />
      </div>

    </>
  );

  function getShortData(data){
    let shortData = data;
    
    if(shortData){ 
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
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
  }

}