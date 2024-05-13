const visualizeTickets = (
  tickets,
  strikedNumbers,
  disabledNumbers,
  handleCellClick
) => {
  if (tickets.ticket) {
    const ticketData = tickets.ticket;
    return (
      <div className="center-play">
        <div className="table">
          <table>
            <tbody>
              {ticketData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`cell-data 
                         ${
                        strikedNumbers.includes(cell) ? "strikethrough" : ""
                      } ${disabledNumbers.includes(cell) ? "disabled" : ""}`}
                      onClick={() => handleCellClick(rowIndex, cellIndex)}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return null;
};

const visualizeHost2PlayerTickets = (
  tickets,
  strikedNumbers,
  disabledNumbers
) => {
  if (tickets.ticket) {
    const ticketData = tickets.ticket;
    return (
      <div className="">
        <div className="table-host">
          <table>
            <tbody>
              {ticketData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`cell-data ${
                        strikedNumbers.includes(cell) ? "strikethrough" : ""
                      } ${disabledNumbers.includes(cell) ? "disabled" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return null;
};

export { visualizeTickets, visualizeHost2PlayerTickets };
