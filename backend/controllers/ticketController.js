const { sequelize } = require('../models'); 
const { QueryTypes } = require('sequelize');
const db = require('../models');
const Tickets = db.tickets

const getTickets = async (req, res) => {
  try {
    const randomTicket = await sequelize.query("SELECT * FROM tickets ORDER BY RAND() LIMIT 1", { type: QueryTypes.SELECT });

    if (!randomTicket.length) {
      return res.status(404).json({ error: "No tickets found" });
    }

    const ticketId = randomTicket[0].id;
    const ticket = mapTicketResultsToRows(randomTicket[0]);

    res.json({ ticket,id: ticketId });
  } catch (error) {
    console.error("Error fetching random tickets:", error);
    res.status(500).json({ error: "Error fetching random tickets" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.id; // Assuming the ticket ID is passed in the URL parameters

    const ticket = await sequelize.query("SELECT * FROM tickets WHERE id = ?", {
      replacements: [ticketId],
      type: QueryTypes.SELECT
    });

    if (!ticket.length) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticketData = mapTicketResultsToRows(ticket[0]);

    res.json({ ticket: ticketData });
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    res.status(500).json({ error: "Error fetching ticket by ID" });
  }
};




function mapTicketResultsToRows(row) {
  return [
    [
      row.cell1,
      row.cell2,
      row.cell3,
      row.cell4,
      row.cell5,
      row.cell6,
      row.cell7,
      row.cell8,
      row.cell9,
    ],
    [
      row.cell10,
      row.cell11,
      row.cell12,
      row.cell13,
      row.cell14,
      row.cell15,
      row.cell16,
      row.cell17,
      row.cell18,
    ],
    [
      row.cell19,
      row.cell20,
      row.cell21,
      row.cell22,
      row.cell23,
      row.cell24,
      row.cell25,
      row.cell26,
      row.cell27,
    ],
  ];
}
async function insertTickets(ticketDataArray) {
  console.log('Inserting tickets data:');
  try {
    await Tickets.bulkCreate(ticketDataArray.map(ticketData => ({
      cell1: ticketData[0],
      cell2: ticketData[1],
      cell3: ticketData[2],
      cell4: ticketData[3],
      cell5: ticketData[4],
      cell6: ticketData[5],
      cell7: ticketData[6],
      cell8: ticketData[7],
      cell9: ticketData[8],
      cell10: ticketData[9],
      cell11: ticketData[10],
      cell12: ticketData[11],
      cell13: ticketData[12],
      cell14: ticketData[13],
      cell15: ticketData[14],
      cell16: ticketData[15],
      cell17: ticketData[16],
      cell18: ticketData[17],
      cell19: ticketData[18],
      cell20: ticketData[19],
      cell21: ticketData[20],
      cell22: ticketData[21],
      cell23: ticketData[22],
      cell24: ticketData[23],
      cell25: ticketData[24],
      cell26: ticketData[25],
      cell27: ticketData[26],
    })));
    console.log('Tickets data inserted successfully.');
  } catch (err) {
    console.error('Error inserting tickets data:', err);
  }
}
function generateTicketData() {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
 
  var rowCount = 3;
  var columnCount = 9;
  var maxRow = 5;
  var cellIndex = [];
  var maxNumInRow = new Array(rowCount).fill(0);
  var minNumInCol = new Array(columnCount).fill(0);
 
  while (cellIndex.length < 15) {
    var randomCell = Math.floor(Math.random() * (rowCount * columnCount));
    var row = Math.floor(randomCell / columnCount);
    var col = Math.floor(randomCell % columnCount);
    if (
      !cellIndex.includes(randomCell) &&
      maxNumInRow[row] < maxRow &&
      (minNumInCol[col] === 0 || maxNumInRow[row] < maxRow - (columnCount - minNumInCol.filter(x => x > 0).length))
    ) {
      cellIndex.push(randomCell);
      maxNumInRow[row]++;
      minNumInCol[col]++;
    }
  }
 
  cellIndex.sort((a, b) => a - b);
 
  var ticket = [];
  for (let i = 0; i < rowCount; i++) {
    var rowNumbers = [];
    for (let j = 0; j < columnCount; j++) {
      rowNumbers.push('');
    }
    ticket.push(rowNumbers);
  }
 
  cellIndex.forEach((cell, index) => {
    let row = Math.floor(cell / columnCount);
    let col = Math.floor(cell % columnCount);
    let min = col * 10 + 1;
    let max = (col + 1) * 10;
 
    // Generate unique numbers for each cell
    let num;
    do {
      num = randomInt(min, max);
    } while (ticket.flat().includes(num));
 
    ticket[row][col] = num;
  });
 
  // Sort numbers within each column in ascending order
  for (let col = 0; col < columnCount; col++) {
    let columnNumbers = ticket.map(row => row[col]).filter(num => num !== '');
    columnNumbers.sort((a, b) => a - b);
    for (let row = 0; row < rowCount; row++) {
      if (ticket[row][col] !== '') {
        ticket[row][col] = columnNumbers.shift();
      }
    }
  }
  let ticketOneDim = ticket.reduce((acc, val) => acc.concat(val), [])
  return ticketOneDim;
}
 

async function generate100Tickets() {
  console.log("Generating tickets...");
  for (let i = 0; i < 78; i++) {
    try {
      const ticketData = generateTicketData();
      if (ticketData.length > 0) {
        await insertTickets([ticketData]);
      } else {
        console.log(`Ticket ${i + 1} is empty.`);
      }
      console.log(`Ticket ${i + 1} generated and inserted successfully.`);
    } catch (error) {
      console.error(`Error generating/inserting ticket ${i + 1}:`, error);
    }
  }
  console.log("Tickets generation completed.");
}

// generate100Tickets();

module.exports = { getTickets ,getTicketById};
