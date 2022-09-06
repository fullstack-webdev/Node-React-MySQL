import './table.scss';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useTable } from 'react-table';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
//MUI
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import imgAncien from '../../assets-game/ancien.webp';
//IMAGES
import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import imgStone from '../../assets-game/stone.webp';
import imgWood from '../../assets-game/wood.webp';
//CUSTOM COMPONENTS
import { Button } from '../../components';
//UTILS
import {
  format,
  getShortData,
} from '../../utils/utils';

const imgRecipe = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/recipe.png';
const imgItem = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/item.png';
const imgTool = 'https://ancient-society.s3.eu-central-1.amazonaws.com/inventory/tool.png';



//COMPONENT
export default function TableMarketplace( props ) {
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

  //INVENTORY
  const [filterInventory, setfilterInventory] = useState(false);
  // useEffect(() => { console.log('filterInventory: ', filterInventory) }, [filterInventory]);
  const [searchValue, setSearchValue] = useState(null);
  const isInventory = ['recipe', 'item', 'tool']

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
            // console.log('row.values.market: ', row.values.market)
            props.callback_buy(
              row.values.id, 
              row.values.type, 
              row.values.name, 
              row.values.quantity, 
              row.values.totalPrice,
              (row.values.market == 'inventory'
                ? 'inventory'
              : row.values.market == 'storage'
                ? 'storage'
              : 'error')
            )
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
    if(row.values.market == 'storage'){
      return <img 
        src={row.values.image} 
        className='mrkt-res'
      />
    }
    
    if(row.values.market == 'inventory'){
      return <span className='mrkt-inv-bk'>
         <img 
          src={row.values.image} 
          className='mrkt-inv'
        />
      </span> 
     
    }
    

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
        Header: 'Market',
        accessor: 'market',
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
      },
      {
        Header: 'Total',
        accessor: 'totalPrice',
        isVisible: true
      },
      {
        Header: 'Expire',
        accessor: 'endingTime',
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
              <img src={imgWood}
                className={props.type == 2 ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                onClick={() => {
                  if (props.type == 2) return
                  setfilterInventory(false);
                  props.callback_setType(2)
                }}
              />

              <img src={imgStone}
                className={props.type == 3 ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                onClick={() => {
                  if (props.type == 3) return
                  setfilterInventory(false);
                  props.callback_setType(3)
                }}
              />
            </div>

            <div className='filters-container filters-inventory'>
              <span>
                <img src={imgRecipe}
                  className={props.type == 'recipe' ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                  onClick={() => {
                    if (props.type == 'recipe') return
                    setfilterInventory(true); 
                    props.callback_setTypeInventory('recipe')
                  }}
                />
                <img src={imgTool}
                  className={props.type == 'tool' ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                  onClick={() => {
                    if (props.type == 'tool') return
                    setfilterInventory(true); 
                    props.callback_setTypeInventory('tool')
                  }}
                />
                <img src={imgItem}
                  className={props.type == 'item' ? 'mrkt-filter filter-active' : 'mrkt-filter'}
                  onClick={() => {
                    if (props.type == 'item') return
                    setfilterInventory(true); 
                    props.callback_setTypeInventory('item')
                  }}
                />
              </span>
              <Paper
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, color: 'white' }}
                  placeholder="Search"
                  inputProps={{ 'aria-label': 'Search' }}
                  defaultValue={props.filter}
                  onChange={e => setSearchValue(e.target.value)}
                  disabled={!isInventory.includes(props.type)}
                />
                <IconButton 
                  type="submit"
                  sx={{ p: '10px' }} aria-label="search"
                  onClick={()=>{
                    if (!isInventory.includes(props.type)) return
                    props.callback_setFilterInventory(searchValue)
                  }} 
                  disabled={!isInventory.includes(props.type)}
                >
                  <SearchIcon />
                </IconButton>
                <Divider sx={{ height: 20, m: 0.5 }} orientation="vertical" />
              </Paper>
            </div>

            {/* <img 
              src={iconRefresh}
              className='mrkt-utils'
              onClick={() => {
                props.callback_refresh()
              }}
            /> */}
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
        {rows.map((row, i) => {
          prepareRow(row);
          return (<>
              <tr 
                id={row.values.id} 
                {...row.getRowProps()}
                className={
                  row.values.status == 1 ? 'onsale'
                  : row.values.status == 4 ? 'owner'
                  : 'error'}>

                {row.cells.map(cell => {

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
            if(!isInventory.includes(props.type)){
              props.page > 1
              ? props.callback_setPage(props.page - 1)
              : null //console.log('Page is already one')
            }else{
              props.page > 1
              ? props.callback_setPageInventory(props.page - 1)
              : null //console.log('Page is already one')
            }
          }
        }/>

        <img 
          src={iconForward}
          className={!props.nextPage ? 'next-page page-disabled' : 'next-page'}
          disabled={!props.nextPage}
          onClick={() => {
            if(!isInventory.includes(props.type)){
              // console.log('callback_setPage')
              props.nextPage 
              ? props.callback_setPage(props.page + 1)
              : null 
            }else{
              // console.log('callback_setPageInventory')
              props.nextPage 
              ? props.callback_setPageInventory(props.page + 1)
              : null 
            }
          }
        }/>

      </div>

    </>
  );
}