import React, { useEffect } from 'react';

function testFetch() {
  useEffect(() => {
    fetch('/api/status')
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }, []);

  // rest of your component...
}

export default testFetch;
