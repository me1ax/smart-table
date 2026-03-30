import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)
      .forEach((elementName) => {
        // Проверяем, существует ли элемент
        if (elements[elementName]) {
            elements[elementName].append(
                ...Object.values(indexes[elementName])
                          .map(name => {
                            const opt = document.createElement('option');
                            opt.value = name;
                            opt.textContent = name;
                            return opt;
                          })
            )
        }
     })

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}