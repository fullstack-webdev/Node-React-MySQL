import './leaderboardTable.scss';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useFilters,
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';

import iconBack from '../../assets-game/arrow_back.svg';
import iconForward from '../../assets-game/arrow_forward.svg';
import { playSound } from '../../utils/sounds';

export default function TableLeaderboard( props ) {

    //Set data as State and Handle Changes
    const [value, setValue] = useState(props.data);
    useEffect(() => { console.log(value), setValue(props.data) }, [props.data]);

//   //Check Windows Size
//   const [matches, setMatches] = useState(
//     window.matchMedia("(min-width: 768px)").matches
//   )
//   useEffect(() => {
//     window
//     .matchMedia("(min-width: 768px)")
//     .addEventListener('change', e => setMatches( e.matches ));
//     // console.log('Window is Desktop? ', matches)
//   }, [matches]);

  //Custom Cell: Image
  const ImgCell = ({ row }) => {
    if(!row.values.image) return <img 
      src={'https://ancient-society.s3.eu-central-1.amazonaws.com/placeholder/no-image.webp'} 
      className='avatar'
    />
    return <img 
      src={row.values.image} 
      className='avatar'
    />
  }
  //Custom Cell: Image
  const ImgEmblemCell = ({ row }) => {
    if(!row.values.imageEmblem) return null
    return <img 
      src={row.values.imageEmblem} 
      className='avatar emblem'
    />
  }
  //Custom Cell: City
  const CityCell = ({ row }) => {
    return <span  
      className='city'>
      {row.values.cityName}
    </span>
  }
  //Custom Cell: Exp
  const ExpCell = ({ row }) => {
    return  format(row.values.experience)
  }

  //Columns
  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
        isVisible: false,
        width: 90
      },
      {
        Header: '#Rank',
        accessor: 'ranking',
        isVisible: true,
        width: 90
      },
      {
        Header: '',
        accessor: 'image',
        Cell: ImgCell,
        isVisible: true,
        width: 90
      },
      {
        Header: '',
        accessor: 'imageEmblem',
        Cell: ImgEmblemCell,
        isVisible: true,
        width: 90
      },
      {
        Header: 'City',
        accessor: 'cityName',
        Cell: CityCell,
        isVisible: true,
        width: 90
      },
      {
        Header: 'Exp',
        accessor: 'experience',
        Cell: ExpCell,
        isVisible: true,
        width: 90
      }
    ],
    []
  );

//   const numericSmallerThanFilter = useCallback((rows, id, filterValue) =>
//     rows.filter(row => row.values[id] <= filterValue), [])

//   const filterTypes = useMemo(() => ({
//     // use filter key from columns to filter this value.
//     // alternately, you could use "between" key,
//     // but then you would have to set the filter as
//     // setFilter(selected, [Number.MIN_SAFE_INTEGER, e.target.value]) in the <input/>'s onChange which could be a pain to handle.
//     numericSmallerThan: numericSmallerThanFilter,
//   }), [numericSmallerThanFilter]);

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
      initialState: { pageSize: 7, pageIndex: props.page },
    //   filterTypes
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
      <table {...getTableProps()} className="tableLeaderboard">
        <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {page?.map((row, i) => {
          prepareRow(row);
          return (
          (pageIndex != 0 || i > 2) &&
            <tr key={row.values.id} id={row.values.id} {...row.getRowProps()}>
              {row?.cells.map(cell => {
                  return <td key={cell.value} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                  </td>;
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
          onClick={() => {
            playSound('touch')
            previousPage()
            props.callback_pageNum(pageIndex - 1)
          } }
        />

        <img 
          src={iconForward}
          className={!canNextPage ? 'next-page page-disabled' : 'next-page'}
          disabled={!canNextPage}
          onClick={() => {
            playSound('touch')
            nextPage()
            props.callback_pageNum(pageIndex + 1)
          }}
        />
      </div>

    </>
  );

  function format(x) {
    let newValue = x;
  
    newValue 
    && (newValue =  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
  }
}