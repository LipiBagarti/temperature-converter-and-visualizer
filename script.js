document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const temperatureInput = document.getElementById('temperature');
    const fromUnitSelect = document.getElementById('from-unit');
    const celsiusResult = document.getElementById('celsius-result');
    const fahrenheitResult = document.getElementById('fahrenheit-result');
    const kelvinResult = document.getElementById('kelvin-result');
    const temperatureScale = document.querySelector('.temperature-scale');
    
    // Temperature conversion functions
    const convertCelsiusTo = {
        celsius: (value) => value,
        fahrenheit: (value) => (value * 9/5) + 32,
        kelvin: (value) => value + 273.15
    };
    
    const convertFahrenheitTo = {
        celsius: (value) => (value - 32) * 5/9,
        fahrenheit: (value) => value,
        kelvin: (value) => (value - 32) * 5/9 + 273.15
    };
    
    const convertKelvinTo = {
        celsius: (value) => value - 273.15,
        fahrenheit: (value) => (value - 273.15) * 9/5 + 32,
        kelvin: (value) => value
    };
    
    // Conversion object
    const conversions = {
        celsius: convertCelsiusTo,
        fahrenheit: convertFahrenheitTo,
        kelvin: convertKelvinTo
    };
    
    // Explanation templates
    const explanations = {
        celsius: {
            celsius: () => 'No conversion needed',
            fahrenheit: (c, f) => `${c}°C × (9/5) + 32 = ${f}°F`,
            kelvin: (c, k) => `${c}°C + 273.15 = ${k}K`
        },
        fahrenheit: {
            celsius: (f, c) => `(${f}°F - 32) × (5/9) = ${c}°C`,
            fahrenheit: () => 'No conversion needed',
            kelvin: (f, k) => `(${f}°F - 32) × (5/9) + 273.15 = ${k}K`
        },
        kelvin: {
            celsius: (k, c) => `${k}K - 273.15 = ${c}°C`,
            fahrenheit: (k, f) => `(${k}K - 273.15) × (9/5) + 32 = ${f}°F`,
            kelvin: () => 'No conversion needed'
        }
    };
    
    // Format the temperature value
    function formatTemperature(value) {
        return parseFloat(value.toFixed(2));
    }
    
    // Determine temperature class (hot, cold, or neutral)
    function getTemperatureClass(unit, value) {
        // Convert all to Celsius for comparison
        let celsius;
        switch (unit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = convertFahrenheitTo.celsius(value);
                break;
            case 'kelvin':
                celsius = convertKelvinTo.celsius(value);
                break;
        }
        
        if (celsius < 10) return 'cold';
        if (celsius > 30) return 'hot';
        return '';
    }

    // Update temperature scale indicator
    function updateTemperatureScaleIndicator(celsius) {
        // Clear previous indicators
        const existingIndicator = temperatureScale.querySelector('.indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (isNaN(celsius)) return;
        
        // Calculate position (0 to 100%)
        // Map from approx -50°C to 150°C to 0-100% of scale width
        const position = Math.max(0, Math.min(100, ((celsius + 50) / 200) * 100));
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        indicator.style.left = `${position}%`;
        indicator.style.backgroundColor = celsius < 10 ? 'var(--cold-color)' : 
                                        celsius > 30 ? 'var(--hot-color)' : '#8e44ad';
        
        // Add indicator to scale
        temperatureScale.appendChild(indicator);
    }
    
    // Convert and display temperatures
    function convertTemperature() {
        const value = parseFloat(temperatureInput.value);
        const fromUnit = fromUnitSelect.value;
        
        if (isNaN(value)) {
            resetResults();
            return;
        }
        
        // Perform conversions
        const celsius = formatTemperature(conversions[fromUnit].celsius(value));
        const fahrenheit = formatTemperature(conversions[fromUnit].fahrenheit(value));
        const kelvin = formatTemperature(conversions[fromUnit].kelvin(value));
        
        // Update results with temperature classes
        updateResultDisplay(celsiusResult, celsius, explanations[fromUnit].celsius(value, celsius), getTemperatureClass('celsius', celsius));
        updateResultDisplay(fahrenheitResult, fahrenheit, explanations[fromUnit].fahrenheit(value, fahrenheit), getTemperatureClass('fahrenheit', fahrenheit));
        updateResultDisplay(kelvinResult, kelvin, explanations[fromUnit].kelvin(value, kelvin), getTemperatureClass('kelvin', kelvin));
        
        // Update chart and temperature scale
        updateChart(celsius);
        updateTemperatureScaleIndicator(celsius);
    }
    
    // Update a result display
    function updateResultDisplay(element, value, explanation, temperatureClass) {
        const valueElement = element.querySelector('.value');
        
        // Remove existing classes
        valueElement.classList.remove('hot', 'cold');
        
        // Add new class if applicable
        if (temperatureClass) {
            valueElement.classList.add(temperatureClass);
        }
        
        valueElement.textContent = value;
        element.querySelector('.explanation').textContent = explanation;
    }
    
    // Reset results
    function resetResults() {
        document.querySelectorAll('.result .value').forEach(el => {
            el.textContent = '-';
            el.classList.remove('hot', 'cold');
        });
        document.querySelectorAll('.result .explanation').forEach(el => el.textContent = '');
        
        // Reset temperature indicator
        const existingIndicator = temperatureScale.querySelector('.indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
    
    // Event listeners
    temperatureInput.addEventListener('input', convertTemperature);
    fromUnitSelect.addEventListener('change', convertTemperature);
    
    // Initialize Chart.js
    const ctx = document.getElementById('tempChart').getContext('2d');
    
    // Reference points
    const referencePoints = [
        { name: 'Absolute Zero', celsius: -273.15 },
        { name: 'Freezing Point', celsius: 0 },
        { name: 'Room Temperature', celsius: 22 },
        { name: 'Body Temperature', celsius: 37 },
        { name: 'Boiling Point', celsius: 100 }
    ];
    
    // Calculate Fahrenheit and Kelvin values for reference points
    referencePoints.forEach(point => {
        point.fahrenheit = convertCelsiusTo.fahrenheit(point.celsius);
        point.kelvin = convertCelsiusTo.kelvin(point.celsius);
    });
    
    // Chart configuration
    let chartConfig = {
        type: 'bar',
        data: {
            labels: referencePoints.map(point => point.name),
            datasets: [
                {
                    label: 'Celsius (°C)',
                    data: referencePoints.map(point => point.celsius),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Fahrenheit (°F)',
                    data: referencePoints.map(point => point.fahrenheit),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Kelvin (K)',
                    data: referencePoints.map(point => point.kelvin),
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature',
                        color: '#2c3e50'
                    },
                    ticks: {
                        color: '#2c3e50'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#2c3e50'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#2c3e50'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        }
    };
    
    // Create chart
    const tempChart = new Chart(ctx, chartConfig);

    // Function to update chart colors for dark/light mode
    function updateChartColors(isDarkMode) {
        const textColor = isDarkMode ? '#f1f1f1' : '#2c3e50';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        tempChart.options.scales.y.title.color = textColor;
        tempChart.options.scales.y.ticks.color = textColor;
        tempChart.options.scales.y.grid.color = gridColor;
        tempChart.options.scales.x.ticks.color = textColor;
        tempChart.options.scales.x.grid.color = gridColor;
        tempChart.options.plugins.legend.labels.color = textColor;
        
        tempChart.update();
    }
    
    // Function to update chart with a marker for current temperature
    function updateChart(celsiusValue) {
        // Implementation for showing current temperature on chart
        // This is a simplified version - could be enhanced further
        if (tempChart.data.datasets.length > 3) {
            tempChart.data.datasets.pop();
        }
        
        if (!isNaN(celsiusValue)) {
            tempChart.data.datasets.push({
                label: 'Current Temperature (°C)',
                data: Array(referencePoints.length).fill(celsiusValue),
                type: 'line',
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                pointRadius: 5,
                fill: false
            });
        }
        
        tempChart.update();
    }
    
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            // Update chart colors
            updateChartColors(isDarkMode);
            
            // Save preference
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            
            // Update toggle icon
            this.innerHTML = isDarkMode ? 
                '<i class="fa-solid fa-sun"></i>' : 
                '<i class="fa-solid fa-moon"></i>';
        });
        
        // Check for saved preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            updateChartColors(true);
        }
    }
    
    // Initialize with empty state
    resetResults();
    
    // Add CSS for the temperature scale indicator
    const style = document.createElement('style');
    style.textContent = `
        .temperature-scale {
            position: relative;
        }
        .temperature-scale .indicator {
            position: absolute;
            width: 12px;
            height: 24px;
            top: -2px;
            transform: translateX(-50%);
            border-radius: 6px;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
            z-index: 10;
        }
    `;
    document.head.appendChild(style);
}); 