const { sequelize } = require('../models'); 
const { QueryTypes } = require('sequelize');

const getTickets = async (req, res) => {
  try {
    const hostResults = await sequelize.query("SELECT * FROM tickets ORDER BY RAND() LIMIT 1", { type: QueryTypes.SELECT });

    if (!hostResults.length) {
      return res.status(404).json({ error: "No tickets found" });
    }

    const guestResults = await sequelize.query("SELECT * FROM tickets WHERE id != ? ORDER BY RAND() LIMIT 1", {
      replacements: [hostResults[0].id],
      type: QueryTypes.SELECT
    });

    if (!guestResults.length) {
      return res.status(404).json({ error: "No tickets found" });
    }

    const hostTicket = mapTicketResultsToRows(hostResults[0]);
    const guestTicket = mapTicketResultsToRows(guestResults[0]);

    res.json({ hostTicket, guestTicket });
  } catch (error) {
    console.error("Error fetching random tickets:", error);
    res.status(500).json({ error: "Error fetching random tickets" });
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

module.exports = { getTickets };
