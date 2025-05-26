fetch('js/jasu2025_data.json')
  .then(response => response.json())
  .then(data => {
    // Сортуємо дані за номером (зростанням)
    data.sort((a, b) => {
      const numA = parseInt(a.number, 10);
      const numB = parseInt(b.number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return (a.number || '').localeCompare(b.number || '', 'uk', {numeric: true});
    });

    const tbody = document.querySelector('#projects-table tbody');
    const departmentFilter = document.getElementById('department-filter');
    const regionFilter = document.getElementById('region-filter');
    const searchInput = document.getElementById('search-input');
    const tableLimit = document.getElementById('table-limit');

    // Зібрати унікальні відділення та області
    const departments = Array.from(new Set(data.map(i => i.department).filter(Boolean))).sort();
    const regions = Array.from(new Set(data.map(i => i.region).filter(Boolean))).sort();

    departments.forEach(dep => {
      const opt = document.createElement('option');
      opt.value = dep;
      opt.textContent = dep;
      departmentFilter.appendChild(opt);
    });
    regions.forEach(reg => {
      const opt = document.createElement('option');
      opt.value = reg;
      opt.textContent = reg;
      regionFilter.appendChild(opt);
    });

    function renderTable() {
      const depVal = departmentFilter.value;
      const regVal = regionFilter.value;
      const searchVal = searchInput.value.trim().toLowerCase();
      let limit = tableLimit.value === 'all' ? Infinity : parseInt(tableLimit.value, 10);

      tbody.innerHTML = '';
      let count = 0;
      for (const item of data) {
        // Формуємо ім'я та прізвище з окремих полів, якщо вони є
        let name = '';
        if (item['Прізвище'] || item['Ім’я'] || item['По батькові']) {
          name = [item['Прізвище'], item['Ім’я'], item['По батькові']].filter(Boolean).join(' ');
        } else if (item.full_name) {
          name = item.full_name;
        } else {
          name = '';
        }

        if (
          (depVal === '' || item.department === depVal) &&
          (regVal === '' || item.region === regVal) &&
          (
            !searchVal ||
            (item.title && item.title.toLowerCase().includes(searchVal)) ||
            (item.number && item.number.toLowerCase().includes(searchVal)) ||
            (item.department && item.department.toLowerCase().includes(searchVal)) ||
            (item.region && item.region.toLowerCase().includes(searchVal)) ||
            (name && name.toLowerCase().includes(searchVal))
          )
        ) {
          if (count >= limit) break;
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.number || item['№'] || ''}</td>
            <td>${item.title || item['Тема'] || ''}</td>
            <td>${item.department || item['Відділення'] || ''}</td>
            <td>${item.region || item['Область'] || ''}</td>
            <td>${
  item.full_name ||
  [item['Прізвище'], item['Ім’я'], item['По батькові']].filter(Boolean).join(' ') ||
  item.participant ||
  ''
}</td>
            <td>${item.detailsLink ? `<a href="${item.detailsLink}" target="_blank">Натиснути</a>` : ''}</td>
            <td>${item.posterLink ? `<a href="${item.posterLink}" target="_blank">Натиснути</a>` : ''}</td>
          `;
          tbody.appendChild(row);
          count++;
        }
      }
      // Додаємо повідомлення, якщо нічого не знайдено
      if (count === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align:center; color:#888; font-size:1.1em;">Нічого не знайдено</td>`;
        tbody.appendChild(row);
      }
    }

    departmentFilter.addEventListener('change', renderTable);
    regionFilter.addEventListener('change', renderTable);
    searchInput.addEventListener('input', renderTable);
    tableLimit.addEventListener('change', renderTable);

    renderTable();
  });