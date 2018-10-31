import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten } from '@material-ui/core/styles/colorManipulator';
/*eslint no-unused-vars: ["off", { "args": "all" }]*/

let counter = 0;
function createData (
  name,
  symbol,
  market_cap,
  price,
  circulating_supply,
  volume_24,
  percent_change_1h,
  percent_change_24h,
  percent_change_7d,
) {
  counter += 1;
  return {
    id: counter,
    name,
    symbol,
    market_cap,
    price,
    circulating_supply,
    volume_24,
    percent_change_1h,
    percent_change_24h,
    percent_change_7d,
  };
}
function desc (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort (array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getSorting (order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const rows = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
  { id: 'symbol', numeric: false, disablePadding: true, label: 'Symbol' },
  { id: 'market_cap', numeric: true, disablePadding: false, label: 'Market Cap' },
  { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
  { id: 'circulating_supply', numeric: true, disablePadding: false, label: 'Circulating Supply' },
  { id: 'volume_24', numeric: true, disablePadding: false, label: 'Volume (24h)' },
  { id: 'percent_change_1h', numeric: true, disablePadding: false, label: '% 1h' },
  { id: 'percent_change_24h', numeric: true, disablePadding: false, label: '% 24h' },
  { id: 'percent_change_7d', numeric: true, disablePadding: false, label: '% 7d ' },
];

class EnhancedTableHead extends React.Component {
  createSortHandler = (property) => (event) => {
    this.props.onRequestSort(event, property);
  };

  render () {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;
    return (
      <TableHead>
        <TableRow>
          <TableCell />
          {rows.map((row, i) => {
            return (
              <TableCell
                key={row.id}
                numeric={row.numeric}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title='Sort'
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            );
          }, this)}
        </TableRow>
      </TableHead>
    );
  }
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const toolbarStyles = (theme) => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
});

let EnhancedTableToolbar = (props) => {
  const { numSelected, classes } = props;

  return (
    <Toolbar
      className={classNames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        {numSelected > 0 ? (
          <Typography color='inherit' variant='title'>
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant='title' id='tableTitle'>
            DATA
          </Typography>
        )}
      </div>
      <div className={classes.spacer} />
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
};

EnhancedTableToolbar = withStyles(toolbarStyles)(EnhancedTableToolbar);

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 1020,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class EnhancedTable extends React.Component {
  componentDidMount () {
    const URL = 'https://api.coinmarketcap.com/v2/ticker/';
    fetch(URL).then((res) => res.json()).then((json) => {
      this.setState({
        data: Object.values(json.data).map((el, i) => {
          return createData(
            el.name,
            el.symbol,
            el.quotes.USD.market_cap,
            Number(el.quotes.USD.price.toFixed(3)),
            el.circulating_supply,
            el.quotes.USD.volume_24h,
            el.quotes.USD.percent_change_1h,
            el.quotes.USD.percent_change_24h,
            el.quotes.USD.percent_change_7d,
          );
        }),
      });
    });
  }
  state = {
    order: 'asc',
    orderBy: 'id',
    selected: [],
    coinData: null,
    data: [],
    page: 1,
    rowsPerPage: 100,
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  handleSelectAllClick = (event) => {
    return;
  };

  handleClick = (event, id) => {
    return;
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = (id) => this.state.selected.indexOf(id) !== -1;

  render () {
    const { classes } = this.props;
    const { data, order, orderBy, selected, rowsPerPage, page, coinData } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby='tableTitle'>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((n) => {
                  const isSelected = this.isSelected(n.id);

                  return (
                    <TableRow
                      hover
                      onClick={(event) => this.handleClick(event, n.id)}
                      aria-checked={isSelected}
                      role='checkbox'
                      tabIndex={-1}
                      key={n.id}
                      selected={isSelected}
                    >
                      <TableCell />
                      <TableCell component='th' scope='row' padding='none'>
                        {n.name}
                      </TableCell>
                      <TableCell>{n.symbol}</TableCell>
                      <TableCell numeric>{n.market_cap}</TableCell>
                      <TableCell numeric>{n.price}</TableCell>
                      <TableCell numeric>{n.circulating_supply}</TableCell>
                      <TableCell numeric>{n.volume_24}</TableCell>
                      <TableCell numeric>{n.percent_change_1h}</TableCell>
                      <TableCell numeric>{n.percent_change_24h}</TableCell>
                      <TableCell numeric>{n.percent_change_7d}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component='div'
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    );
  }
}

EnhancedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EnhancedTable);
