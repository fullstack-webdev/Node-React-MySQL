import './table.scss';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTable } from 'react-table';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//MUI
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import imgAncien from '../../assets-game/ancien.webp';
//IMAGES
import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import iconRefresh from '../../assets-game/refresh.svg';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
//CUSTOM COMPONENTS
import { Button } from '../../components';

export default function TableHistory( props ) {
  const [idDelegate, setIdDelegate] = useState(props.idDelegate)
  useEffect(() => { setIdDelegate(props.idDelegate)}, [props.idDelegate])
  
  //Set inventory as State and Handle Changes
  const [ancien, setAncien] = useState(props.ancien);
  useEffect(() => { setAncien(props.ancien) }, [props.ancien]);

  //Set data as State and Handle Changes
  const [value, setValue] = useState(props.data);
  useEffect(() => { setValue(props.data) }, [props.data]);

  //Set page as State and Handle Changes
  const [currentPage, setCurrentPage] = useState(props.page);
  useEffect(() => { setCurrentPage(props.page) }, [props.page]);

  //Set nextPage as State and Handle Changes
  const [nextPage, setNextPage] = useState(props.nextPage);
  useEffect(() => { setNextPage(props.nextPage) }, [props.nextPage]);

  //Set type (filter) as State and Handle Changes
  const [type, setType] = useState(props.type);
  useEffect(() => { setType(props.type) }, [props.type]);

  const [isChecked, SetIsChecked] = useState(true);

  const [collapse, setCollapse] = useState(false);

  //Check Windows Size
  const [matches, setMatches] = useState(window.matchMedia("(min-width: 768px)").matches)
  useEffect(() => {
    window
    .matchMedia("(min-width: 768px)")
    .addEventListener('change', e => setMatches( e.matches ));
    // console.log('Window is Desktop? ', matches)
  }, [matches]);



  //Custom Cell: Buy
  const BuyCell = ({row, ancien}) => {
    //I'm NOT the Owner && Ancien Balance is enough
    if(row.values.status == 1 && parseInt(row.values.totalPrice) <= ancien){
      return <Button
        style='marketplace-btn-buy'
        text='BUY' 
        onButtonClick={() => {
          props.callback_buy(row.values.id, row.values.type, row.values.quantity, row.values.totalPrice)
      }}/>
    }

    //I'm NOT the Owner BUT Ancien Balance is NOT enough
    else if (row.values.status == 1 && parseInt(row.values.totalPrice) > ancien){
      return <Button
        style='marketplace-btn-buy miss-ancien'
        text='BUY' 
        onButtonClick={() => {null}}
      />

    //I'm the Owner
    } else { return null }
  }

  //Custom Cell: Image
  const ImgCell = ({ row }) => {
    return <img 
      src={row.values.image} 
      className='mrkt-res'
    />
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
        isVisible: false
      },
      {
        Header: '',
        accessor: 'image',
        Cell: ImgCell,
        isVisible: true
      },
      {
        Header: 'Name',
        accessor: 'name',
        isVisible: true
      },
      {
        Header: 'Qt',
        accessor: 'quantity',
        isVisible: true
      },
      {
        Header: 'P/U',
        accessor: 'price',
        isVisible: true,
        isVisible: true
      },
      {
        Header: 'Total',
        accessor: 'totalPrice',
        isVisible: true
      },
      {
        Header: 'Sold',
        accessor: 'saleTime',
        isVisible: matches
      },
      {
        Header: '',
        accessor: "buyButton",
        Cell: BuyCell,
        isVisible: true 
     }

    ],
    []
  );

   
  
  //useTable Init
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,

  } = useTable(
    {
      columns,
      data: value,
      ancien
    },
    // tableHooks
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

      <div className="filters">

        

      <Card>
        <CardActions onClick={() => setCollapse(!collapse)}>
          <Typography title={'Test'}>
            {'Filters'}
          </Typography>
          <IconButton
            disableRipple
            aria-expanded={collapse}
            aria-label="Show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse
          in={collapse}
          timeout="auto"
          unmountOnExit
        >
          <CardContent>
            <div className='filters-container'>
              <img 
                src={imgWood}
                className={props.type == 2 ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                onClick={() => {
                  props.type != 2
                  ? props.callback_setType(2)
                  : props.callback_setType(null)
                }}
              />

              <img 
                src={imgStone}
                className={props.type == 3 ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                onClick={() => {
                  props.type != 3
                  ? props.callback_setType(3)
                  : props.callback_setType(null)
                }}
              />
            </div>

            <img 
              src={iconRefresh}
              className='mrkt-utils'
              onClick={() => {
                props.callback_refresh()
              }}
            />
          </CardContent>
        </Collapse>
      </Card>
        

      </div>

      <table {...getTableProps()} className="marketplace-table">
        <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              // console.log(column)
              (column.id == 'price') ?
                <th {...column.getHeaderProps()} className='th-price'>
                  P/U <img src={imgAncien}/>
                </th>
              : (column.id == 'totalPrice') ?
              <th {...column.getHeaderProps()} className='th-price'>
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
        {rows.map(row => {
          prepareRow(row);
          return (<>
              <tr 
                id={row.values.id} 
                {...row.getRowProps()}
                className={
                  row.values.status == 1 ? 'onsale'
                  : row.values.status == 4 ? 'owner'
                  : 'error'}>

                {row.cells.map(cell=> {

                  //Time > OnSale Cell
                  if(
                    cell.column.id == 'endingTime'){
                    return <td {...cell.getCellProps()} className='cell-onsale'>{
                      getShortData(cell.value)
                  }</td>;

                  }else if(
                    cell.column.id == 'saleTime'){
                    return <td {...cell.getCellProps()} className='cell-onsale'>{
                      getShortData(cell.value)
                  }</td>;

                  //Type > Resource Image
                  }else if(cell.column.Header == 'Type'){
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
                  }else if(cell.column.Header == 'Qt' || cell.column.Header == 'Total'){
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

          </>);
        })}
        </tbody>
      </table>

      <div className="pages">

        <img 
          src={iconBack}
          className={props.page == 1 ? 'back-page page-disabled' : 'next-page'}
          disabled={props.page == 1}
          onClick={() => {
            props.page > 1
            ? props.callback_setPage(props.page - 1)
            : null //console.log('Page is already one')
          }
        }/>

        <img 
          src={iconForward}
          className={!props.nextPage ? 'next-page page-disabled' : 'next-page'}
          disabled={!props.nextPage}
          onClick={() => {
            props.nextPage
            ? props.callback_setPage(props.page + 1)
            : null //console.log('Next page is not available')
          }
        }/>

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