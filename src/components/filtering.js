export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
      Object.keys(indexes).forEach((elementName) => {
          // Проверяем, существует ли элемент
          if (elements[elementName]) {
              // Очищаем select перед добавлением новых опций
              elements[elementName].innerHTML = '';
              elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                  const el = document.createElement('option');
                  el.textContent = name;
                  el.value = name;
                  return el;
              }));
          }
      });
  };

  const applyFiltering = (query, state, action) => {
      // Обработка очистки полей
      if (action && action.name === 'clear') {
          Object.keys(elements).forEach(key => {
              if (elements[key]) {
                  elements[key].value = '';
              }
          });
      }

      // Формируем объект фильтрации для сервера
      const filter = {};
      Object.keys(elements).forEach(key => {
          if (elements[key]) {
              if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                  filter[`filter[${elements[key].name}]`] = elements[key].value;
              }
          }
      });

      // Если есть фильтры, добавляем их к query
      return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
  };

  return {
      updateIndexes,
      applyFiltering
  };
}