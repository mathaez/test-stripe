let currentQuestion = 0;
let answers = new Array(questions.length).fill([]);
let conversationHistory = [];

function calculateMindScores() {
    let scores = {
        CD: 0,
        CG: 0,
        LD: 0,
        LG: 0
    };
    
    let totalSelections = 0;
    
    answers.forEach((questionAnswers, qIndex) => {
        questionAnswers.forEach(optionIndex => {
            const selectedOption = questions[qIndex].options[optionIndex];
            scores[selectedOption.type]++;
            totalSelections++;
        });
    });
    
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        return {
            scores: {
                CD: 25,
                CG: 25,
                LD: 25,
                LG: 25
            },
            dominant: "CD",
            secondary: "CG"
        };
    }
    
    const percentages = {};
    for (let key in scores) {
        percentages[key] = parseFloat(((scores[key] / total) * 100).toFixed(1));
    }
    
    // Determine dominant and secondary quadrants
    const sortedQuadrants = Object.entries(percentages)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
    const dominant = sortedQuadrants[0][0];
    const secondary = sortedQuadrants[1][0];
    
    return {
        scores: percentages,
        dominant: dominant,
        secondary: secondary
    };
}

function optimiserPortefeuille(CG, CD, LG, LD) {
    const total = CG + CD + LG + LD;
    
    const weights = {
        "CG": CG / total,
        "CD": CD / total,
        "LG": LG / total,
        "LD": LD / total
    };

    let actions = 40 * weights["CD"] + 10 * weights["CG"];
    let obligations = 35 * weights["CG"] + 10 * weights["LG"];
    let fondsIndiciels = 30 * weights["LG"] + 15 * weights["CG"] + 10 * weights["CD"];
    let liquidites = 40 * weights["LD"] + 10 * weights["LG"];

    const totalAlloc = actions + obligations + fondsIndiciels + liquidites;
    return {
        "actions": Math.round(actions / totalAlloc * 100),
        "obligations": Math.round(obligations / totalAlloc * 100),
        "fondsIndiciels": Math.round(fondsIndiciels / totalAlloc * 100),
        "liquidites": Math.round(liquidites / totalAlloc * 100)
    };
}

async function updateQuestion() {
    document.getElementById('questionNumber').textContent = currentQuestion + 1;
    document.getElementById('questionText').textContent = questions[currentQuestion].text;
    document.getElementById('progressBar').style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    questions[currentQuestion].options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';
        if (answers[currentQuestion].includes(index)) {
            div.classList.add('selected');
        }
        div.textContent = option.text;
        div.onclick = () => toggleOption(index);
        optionsContainer.appendChild(div);
    });

    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    document.getElementById('nextBtn').textContent = currentQuestion === questions.length - 1 ? 'Voir les résultats' : 'Suivant'; 
    
    // Reset audio button
    const playButton = document.getElementById('playQuestionAudio');
    if (playButton) {
        playButton.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
            </svg>
        `;
    }
}

function toggleOption(index) {
    const currentAnswers = answers[currentQuestion];
    const position = currentAnswers.indexOf(index);
    
    if (position === -1) {
        if (currentAnswers.length < 3) {  
            answers[currentQuestion] = [...currentAnswers, index];
        }
    } else {
        answers[currentQuestion] = currentAnswers.filter(i => i !== index);
    }
    
    updateQuestion();
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        updateQuestion();
    }
}

function nextQuestion() {
    if (answers[currentQuestion].length === 0) {
        alert("Veuillez sélectionner au moins une option avant de continuer.");
        return;
    }

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        updateQuestion();
    } else {
        displayResults();
    }
}

function displayResults() {
    const results = calculateMindScores();
    const percentages = results.scores;
    const dominant = results.dominant;
    const secondary = results.secondary;
    
    const optimizedPortfolio = optimiserPortefeuille(
        parseFloat(percentages.CG),
        parseFloat(percentages.CD),
        parseFloat(percentages.LG),
        parseFloat(percentages.LD)
    );
    
    // Add these two lines to define the variables needed later
    const dominantQuadrant = dominant;
    const secondaryQuadrant = secondary;
    
    // Calculate risk metrics
    const riskScore = calculateRiskScore(percentages);
    const timeHorizon = calculateTimeHorizon(percentages);
    const diversificationLevel = calculateDiversificationLevel(percentages);

    // Calculate financial strengths and weaknesses
    const financialStrengths = calculateFinancialStrengths(percentages, dominant, secondary);
    const financialWeaknesses = calculateFinancialWeaknesses(percentages, dominant, secondary);

    document.getElementById('app').innerHTML = `
        <div class="report-container">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="/LOGOMIND.png" alt="Mind Logo" style="height: 80px; margin-bottom: 10px;">
            </div>
            <h1>Rapport MindScore Personnel
                <button id="playReportAudio" class="audio-button" style="display: inline-flex; margin-left: 10px; padding: 5px; width: 36px; height: 36px; vertical-align: middle;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                </button>
                <audio id="reportAudio" style="display: none;"></audio>
            </h1>
            
            <div class="brain-visualization-container" style="text-align: center; margin: 30px auto;">
                <div class="brain-container">
                    <img src="/4_cadrans_5-removebg-preview (1).png" alt="Brain Quadrants" style="width: 80%; max-width: 300px;">
                    <div class="quadrant-results">
                        <div class="quadrant-result cg ${dominant === 'CG' ? '' : ''}" style="position: absolute; top: 25%; left: 22%; transform: translate(-50%, -50%);" onclick="showQuadrantInfo('CG')">
                            <span class="quadrant-percentage">${percentages.CG}%</span>
                        </div>
                        <div class="quadrant-result cd ${dominant === 'CD' ? '' : ''}" style="position: absolute; top: 25%; right: 22%; transform: translate(50%, -50%);" onclick="showQuadrantInfo('CD')">
                            <span class="quadrant-percentage">${percentages.CD}%</span>
                        </div>
                        <div class="quadrant-result lg ${dominant === 'LG' ? '' : ''}" style="position: absolute; bottom: 25%; left: 22%; transform: translate(-50%, 50%);" onclick="showQuadrantInfo('LG')">
                            <span class="quadrant-percentage">${percentages.LG}%</span>
                        </div>
                        <div class="quadrant-result ld ${dominant === 'LD' ? '' : ''}" style="position: absolute; bottom: 25%; right: 22%; transform: translate(50%, 50%);" onclick="showQuadrantInfo('LD')">
                            <span class="quadrant-percentage">${percentages.LD}%</span>
                        </div>
                    </div>
                </div>
                <p style="font-style: italic; margin-top: 10px; color: #666;">Cliquez sur les % pour afficher le détail</p>
            </div>
            
            <div class="summary-section">
                <h2>Votre profil dominant : ${getQuadrantDescription(dominant)} (${percentages[dominant]}%)</h2>
            </div>

            <div class="explanation-container" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid var(--primary-color);">
                <h3 style="color: var(--primary-color); margin-top: 0;">Qu'est-ce que cela signifie ?</h3>
                <p>Votre profil dominant représente la région cérébrale que vous utilisez préférentiellement dans vos processus de décision financière. C'est votre <strong style="color: var(--primary-color);">signature cognitive</strong> qui influence directement votre façon d'aborder l'investissement, l'épargne et la gestion de patrimoine.</p>
                <p style="margin-bottom: 0;"><strong style="color: var(--primary-color);">Cette dominance de ${getQuadrantDescription(dominant)}</strong> indique que votre cerveau traite prioritairement l'information financière à travers le prisme ${dominant === 'CG' ? "de l'analyse rationnelle et de la logique" : dominant === 'CD' ? "de la créativité et de la vision globale" : dominant === 'LG' ? "de l'organisation et de la structure" : "de l'émotion et des relations interpersonnelles"}. Elle détermine vos forces naturelles, vos préférences instinctives et votre zone de confort psychologique en matière de gestion financière.</p>
            </div>

            <div class="mind-score-section">
                <h3>Analyse détaillée de vos <span class="info-tooltip-trigger">Forces cognitives
                    <div class="info-tooltip">
                        Les forces cognitives représentent les modes de traitement de l'information que votre cerveau utilise préférentiellement dans le contexte financier. <br><br>
                        <strong>Exemple :</strong> Une dominance "Limbique Droit" indique que vous êtes plus sensible aux aspects émotionnels et relationnels des décisions d'investissement, et que vous accordez une grande importance à l'alignement entre vos valeurs personnelles et vos choix financiers.
                    </div>
                </span></h3>
                <div class="score-commentary">
                    <p>Votre évaluation reflète une combinaison unique de vos forces cognitives qui influencent votre approche financière :</p>
                </div>
                
                <div class="score-details">
                    ${Object.entries(percentages)
                        .sort(([keyA, valueA], [keyB, valueB]) => {
                            // Custom sorting to swap CD and CG positions
                            if (keyA === 'CD' && keyB === 'CG') return 1;
                            if (keyA === 'CG' && keyB === 'CD') return -1;
                            // Additional sorting to swap LD and LG positions
                            if (keyA === 'LD' && keyB === 'LG') return 1;
                            if (keyA === 'LG' && keyB === 'LD') return -1;
                            return 0;
                        })
                        .map(([key, value]) => `
                            <div class="score-item">
                                <div class="score-header">
                                    <div class="score-title">
                                        <h4>${getQuadrantDescription(key)}</h4>
                                        <span class="score-value">${value}%</span>
                                    </div>
                                    <div class="progress-circle" style="--progress: ${getProgressDegrees(value)}deg">
                                        <svg viewBox="0 0 36 36" class="circular-chart">
                                            <path class="circle-bg"
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path class="circle"
                                                stroke-dasharray="${value}, 100"
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <text x="18" y="20.35" class="percentage">${value}%</text>
                                        </svg>
                                    </div>
                                </div>
                                <div class="trait-tags">
                                    ${getQuadrantTraits(key).map(trait => 
                                        `<span class="trait-tag">${trait}</span>`
                                    ).join('')}
                                </div>
                                <div class="score-interpretation">
                                    <p>${getScoreInterpretation(key, value)}</p>
                                </div>
                                <div class="key-indicators">
                                    <div class="indicator">
                                        <span class="indicator-label">Force
                                            <div class="indicator-tooltip">
                                                Cette mesure indique l'intensité avec laquelle cette force influence vos décisions financières. Avec ${value}%, cette force est ${value < 30 ? 'modérée - vous utilisez occasionnellement ce mode de pensée' : value < 60 ? 'significative - vous utilisez régulièrement ce mode de pensée' : 'dominante - c\'est votre mode de pensée principal'}.
                                            </div>
                                        </span>
                                        <div class="indicator-bar" style="width: ${value}%"></div>
                                    </div>
                                    <div class="indicator">
                                        <span class="indicator-label">Impact
                                            <div class="indicator-tooltip">
                                                Cette mesure reflète l'influence de cette force sur vos résultats financiers. Avec ${value * 0.8}%, cet impact est ${value * 0.8 < 24 ? 'limité - ce mode de pensée affecte peu vos performances' : value * 0.8 < 48 ? 'notable - ce mode de pensée contribue à vos décisions clés' : 'majeur - ce mode de pensée détermine largement vos résultats'}.
                                            </div>
                                        </span>
                                        <div class="indicator-bar" style="width: ${value * 0.8}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="financial-profile-section" style="background-color: #f8f9fa; border-radius: 15px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3>Votre profil d'investissement</h3>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="var(--primary-color)"/>
                            </svg>
                        </div>
                        <h4>Style d'investissement</h4>
                        <p class="profile-value">${getQuadrantInvestmentStyle(dominant)}</p>
                        <p class="profile-desc">${getQuadrantInvestmentStyleDescription(dominant)}</p>
                    </div>
                    
                    <div class="profile-item">
                        <div class="profile-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="var(--primary-color)"/>
                            </svg>
                        </div>
                        <h4>Processus de décision</h4>
                        <p class="profile-value">${getQuadrantDecisionProcess(dominant)}</p>
                        <p class="profile-desc">${getQuadrantDecisionProcessDescription(dominant)}</p>
                    </div>
                    
                    <div class="profile-item">
                        <div class="profile-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="var(--primary-color)"/>
                            </svg>
                        </div>
                        <h4>Bien-être financier</h4>
                        <p class="profile-value">${getQuadrantWellbeing(dominant)}</p>
                        <p class="profile-desc">${getQuadrantWellbeingDescription(dominant)}</p>
                    </div>
                    
                    <div class="profile-item">
                        <div class="profile-icon">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="var(--primary-color)"/>
                            </svg>
                        </div>
                        <h4>Thématique d'investissement</h4>
                        <p class="profile-value">${getQuadrantTheme(dominant)}</p>
                        <p class="profile-desc">${getQuadrantThemeDescription(dominant)}</p>
                    </div>
                </div>
            </div>
            
            <div class="score-tables">
                <table class="traits-table">
                    <thead>
                        <tr>
                            <th>Caractéristique</th>
                            <th>Niveau</th>
                            <th>Impact sur l'investissement</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Analyse</td>
                            <td>
                                <div class="mini-progress-circle" style="--progress: ${getTraitLevel(percentages.CG)}%">
                                    <span class="mini-progress-text" style="font-weight: bold; color: var(--primary-color);">${getTraitLevel(percentages.CG)}%</span>
                                </div>
                            </td>
                            <td>Capacité à évaluer les opportunités de manière rationnelle</td>
                        </tr>
                        <tr>
                            <td>Organisation</td>
                            <td>
                                <div class="mini-progress-circle" style="--progress: ${getTraitLevel(percentages.LG)}%">
                                    <span class="mini-progress-text" style="font-weight: bold; color: var(--primary-color);">${getTraitLevel(percentages.LG)}%</span>
                                </div>
                            </td>
                            <td>Discipline dans le suivi des stratégies d'investissement</td>
                        </tr>
                        <tr>
                            <td>Intuition</td>
                            <td>
                                <div class="mini-progress-circle" style="--progress: ${getTraitLevel(percentages.LD)}%">
                                    <span class="mini-progress-text" style="font-weight: bold; color: var(--primary-color);">${getTraitLevel(percentages.LD)}%</span>
                                </div>
                            </td>
                            <td>Sensibilité aux tendances de marché</td>
                        </tr>
                        <tr>
                            <td>Innovation</td>
                            <td>
                                <div class="mini-progress-circle" style="--progress: ${getTraitLevel(percentages.CD)}%">
                                    <span class="mini-progress-text" style="font-weight: bold; color: var(--primary-color);">${getTraitLevel(percentages.CD)}%</span>
                                </div>
                            </td>
                            <td>Capacité à identifier des opportunités uniques</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="risk-metrics-section">
                <h4>Métriques d'investissement</h4>
                <div class="risk-metrics-grid">
                    <div class="risk-metric" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="risk-gauge">
                            <svg viewBox="0 0 120 120" class="gauge">
                                <path class="gauge-bg" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="#eee" stroke-width="15" />
                                <path class="gauge-fill" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="var(--primary-color)" stroke-width="15" stroke-dasharray="${riskScore*1.8},180" />
                                <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold">${riskScore}%</text>
                                <text x="60" y="85" text-anchor="middle" font-size="12">Risque</text>
                            </svg>
                        </div>
                        <p>Votre tolérance au risque est ${riskScore < 40 ? 'faible' : riskScore < 60 ? 'modérée' : 'élevée'}. Cela influence le type d'actifs qui vous conviennent.</p>
                    </div>
                    
                    <div class="risk-metric" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="risk-gauge">
                            <svg viewBox="0 0 120 120" class="gauge">
                                <path class="gauge-bg" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="#eee" stroke-width="15" />
                                <path class="gauge-fill" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="var(--primary-color)" stroke-width="15" stroke-dasharray="${timeHorizon*1.8},180" />
                                <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold">${timeHorizon}%</text>
                                <text x="60" y="85" text-anchor="middle" font-size="12">Horizon</text>
                            </svg>
                        </div>
                        <p>Vous avez une vision ${timeHorizon < 40 ? 'court terme' : timeHorizon < 60 ? 'moyen terme' : 'long terme'} de vos investissements, ce qui définit votre stratégie temporelle.</p>
                    </div>
                    
                    <div class="risk-metric" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="risk-gauge">
                            <svg viewBox="0 0 120 120" class="gauge">
                                <path class="gauge-bg" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="#eee" stroke-width="15" />
                                <path class="gauge-fill" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="var(--primary-color)" stroke-width="15" stroke-dasharray="${diversificationLevel*1.8},180" />
                                <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold">${diversificationLevel}%</text>
                                <text x="60" y="85" text-anchor="middle" font-size="12">Diversification</text>
                            </svg>
                        </div>
                        <p>Votre tendance à diversifier est ${diversificationLevel < 40 ? 'limitée' : diversificationLevel < 60 ? 'équilibrée' : 'forte'}, ce qui impacte la répartition de vos actifs.</p>
                    </div>
                    
                    <div class="risk-metric" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div class="risk-gauge">
                            <svg viewBox="0 0 120 120" class="gauge">
                                <path class="gauge-bg" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="#eee" stroke-width="15" />
                                <path class="gauge-fill" d="M20,100 A 60,60 0 1 1 100,100" fill="none" stroke="var(--primary-color)" stroke-width="15" stroke-dasharray="${calculateMarketTiming(percentages)*1.8},180" />
                                <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold">${calculateMarketTiming(percentages)}%</text>
                                <text x="60" y="85" text-anchor="middle" font-size="12">Timing</text>
                            </svg>
                        </div>
                        <p>Votre capacité de timing de marché est ${calculateMarketTiming(percentages) < 40 ? 'prudente' : calculateMarketTiming(percentages) < 60 ? 'équilibrée' : 'réactive'}, influençant votre aptitude à saisir les opportunités.</p>
                    </div>
                </div>
            </div>

            <div class="investment-recommendations">
                <div class="allocation-section">
                    <h4>Allocation d'actifs adaptée
                        <span class="info-tooltip-trigger">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-left: 5px; vertical-align: middle;">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                            </svg>
                            <div class="info-tooltip">
                                Il s'agit d'une allocation d'actifs liée à ce que votre cerveau peut accepter. Elle doit être complétée par un bilan de votre patrimoine avec <strong>MIRA</strong>, notre agent IA, et avec votre conseiller financier.
                            </div>
                        </span>
                    </h4>
                    <p style="text-align: center; margin-top: 0; margin-bottom: 15px; font-style: italic; color: #666;">Cliquez sur les graphiques pour afficher le détail</p>
                    <div class="allocation-grid">
                        <div class="allocation-item" onclick="showProducts('actions', '${dominant}')">
                            <div class="progress-circle" style="--progress: ${getProgressDegrees(optimizedPortfolio.actions)}deg">
                                <span class="progress-text">${optimizedPortfolio.actions}%</span>
                            </div>
                            <p>Actions</p>
                        </div>
                        <div class="allocation-item" onclick="showProducts('obligations', '${dominant}')">
                            <div class="progress-circle" style="--progress: ${getProgressDegrees(optimizedPortfolio.obligations)}deg">
                                <span class="progress-text">${optimizedPortfolio.obligations}%</span>
                            </div>
                            <p>Obligations</p>
                        </div>
                        <div class="allocation-item" onclick="showProducts('fondsIndiciels', '${dominant}')">
                            <div class="progress-circle" style="--progress: ${getProgressDegrees(optimizedPortfolio.fondsIndiciels)}deg">
                                <span class="progress-text">${optimizedPortfolio.fondsIndiciels}%</span>
                            </div>
                            <p>Fonds indiciels</p>
                        </div>
                        <div class="allocation-item">
                            <div class="progress-circle" style="--progress: ${getProgressDegrees(optimizedPortfolio.liquidites)}deg">
                                <span class="progress-text">${optimizedPortfolio.liquidites}%</span>
                            </div>
                            <p>Liquidités</p>
                        </div>
                    </div>
                    <div id="productsModal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <span class="close-modal">&times;</span>
                            <h3>Produits recommandés</h3>
                            <div id="productsList"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="biases-section">
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">Biais cognitifs principaux</h3>
                <p style="margin-bottom: 20px;">Les biais cognitifs sont des schémas de pensée qui peuvent influencer vos décisions financières, parfois de manière inconsciente. Votre profil révèle une susceptibilité particulière aux biais suivants :</p>
                
                <div class="risk-metrics-section" style="margin-top: 0; box-shadow: none; padding: 0;">
                    <div class="action-steps">
                        ${getBiasesByProfile(percentages)}
                    </div>
                </div>
            </div>
            
            <div class="conclusion-container" style="background-color: #f8f9fa; padding: 25px; border-radius: 15px; margin: 30px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 5px solid var(--primary-color);">
                <h3 style="color: var(--primary-color); margin-top: 0;">Conclusion</h3>
                <p>Votre profil MindScore révèle une préférence cognitive de type <strong>${getQuadrantDescription(dominant)}</strong> (${percentages[dominant]}%) avec une influence secondaire de <strong>${getQuadrantDescription(secondary)}</strong> (${percentages[secondary]}%).</p>
                <p>Cette combinaison façonne votre approche d'investissement et influence vos décisions financières. En comprenant comment votre cerveau traite naturellement l'information, vous pouvez développer des stratégies plus adaptées à votre profil cognitif.</p>
                <p>Pour optimiser vos performances financières, nous vous recommandons de :</p>
                <ul style="margin-top: 10px; margin-bottom: 15px;">
                    <li>Tirer parti de vos forces cognitives dominantes tout en développant vos quadrants moins utilisés</li>
                    <li>Adopter l'allocation d'actifs proposée qui correspond à votre profil neuropsychologique</li>
                    <li>Rester vigilant face aux biais cognitifs identifiés qui pourraient influencer vos décisions</li>
                </ul>
                <p style="margin-bottom: 0;">Ce rapport constitue un point de départ pour développer une meilleure connaissance de soi en matière financière. Pour approfondir cette analyse et obtenir un plan d'action personnalisé, n'hésitez pas à consulter un de nos conseillers certifiés en neurosciences financières.</p>
            </div>
            
            <div class="action-steps-section">
                <h4>Actions concrètes recommandées</h4>
                <div class="action-steps">
                    ${generateActionSteps(dominant, secondary).map((step, index) => 
                        `<div class="action-step">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-content">
                                <h5>${step.title}</h5>
                                <p>${step.description}</p>
                            </div>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <div class="chat-container" id="chatContainer">
                <div class="chat-header">Assistant MindScore</div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">Bonjour ! Je suis votre assistant MindScore. Comment puis-je vous aider aujourd'hui ?</div>
                </div>
                <div class="chat-input">
                    <input type="text" id="userInput" placeholder="Tapez votre message..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.707 7.293L1.707 0.293C1.434 0.156 1.118 0.138 0.833 0.243C0.548 0.348 0.320 0.565 0.2 0.85C0.080 1.135 0.079 1.458 0.198 1.744C0.316 2.030 0.543 2.249 0.827 2.356L10.587 6L0.827 9.644C0.543 9.751 0.316 9.970 0.198 10.256C0.079 10.542 0.080 10.865 0.2 11.15C0.320 11.435 0.548 11.652 0.833 11.757C1.118 11.862 1.434 11.844 1.707 11.707L15.707 4.707C15.937 4.592 16.121 4.404 16.232 4.173C16.343 3.941 16.374 3.678 16.321 3.427C16.267 3.175 16.131 2.949 15.935 2.786C15.739 2.623 15.494 2.532 15.24 2.529C15.395 2.526 15.548 2.491 15.688 2.426C15.827 2.362 15.95 2.270 16.045 2.158C16.141 2.045 16.209 1.914 16.244 1.773C16.279 1.631 16.281 1.484 16.249 1.341C16.217 1.199 16.152 1.066 16.059 0.951C15.966 0.837 15.847 0.743 15.711 0.675C15.574 0.608 15.423 0.57 15.271 0.564C15.119 0.558 14.966 0.585 14.824 0.641L14.707 0.707L15.707 7.293Z" fill="white"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        document.querySelectorAll('.brain-quadrant').forEach(quadrant => {
            quadrant.addEventListener('click', () => {
                const id = quadrant.id.substring(8);
                showQuadrantInfo(id);
            });
        });
        
        // Set up audio functionality for report introduction
        const playReportButton = document.getElementById('playReportAudio');
        const reportAudio = document.getElementById('reportAudio');
        
        if (playReportButton && reportAudio) {
            playReportButton.addEventListener('click', function() {
                if (reportAudio.paused) {
                    playReportIntroduction();
                } else {
                    reportAudio.pause();
                }
            });
            
            reportAudio.addEventListener('ended', function() {
                playReportButton.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                `;
            });
        }
        
        // Set up audio functionality
        const playIntroButton = document.getElementById('playIntroAudio');
        const introAudio = document.getElementById('introAudio');
        
        if (playIntroButton && introAudio) {
            playIntroButton.addEventListener('click', function() {
                if (introAudio.paused) {
                    playReportIntroduction();
                    playIntroButton.innerHTML = `
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                        </svg>
                    `;
                } else {
                    introAudio.pause();
                    playIntroButton.innerHTML = `
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                        </svg>
                    `;
                }
            });
            
            introAudio.addEventListener('ended', function() {
                playIntroButton.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                `;
            });
        }
    }, 500);
}

async function playReportIntroduction() {
    const reportText = `Bienvenue dans la compréhension de votre rapport
Vous allez découvrir comment fonctionne votre cerveau quand vous prenez des décisions liées à l'argent
Le graphique représente l'activité cérébrale dominante, indiquant que votre cerveau mobilise certaines zones plus que d'autres
L'analyse détaillée révèle comment vous prenez des décisions en combinant analyse,créativité, organisation et relation
Le tableau suivant présente votre profil d'investisseur à travers ses principales caractéristiques cognitives et décisionnelles
Les métriques mesurent ce que votre cerveau tolère en matière de risque, d'horizon de placement et de diversification. Elles définissent ainsi votre zone de confort psychologique en investissement, que nous traduisons ensuite en une allocation d'actifs adaptée`;

    try {
        // Create a simple Audio element and play the audio directly
        const audioElement = document.getElementById('reportAudio');
        
        // Montrer l'état de chargement
        const playReportButton = document.getElementById('playReportAudio');
        playReportButton.innerHTML = `
            <div class="typing-indicator" style="margin: 0;">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        // Simuler la génération de parole
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate text to speech using the API
        const result = await websim.textToSpeech({
            text: reportText,
            voice: "fr-male",
        });
        
        // Set the audio source to the URL returned by the API
        audioElement.src = result.url;
        
        // Add event listener for errors
        audioElement.onerror = function(e) {
            console.error('Audio playback error:', e);
            playReportButton.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                </svg>
            `;
        };
        
        // Use a try-catch block for play() to handle interruptions
        try {
            await audioElement.play();
            
            // Change to pause icon
            playReportButton.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                </svg>
            `;
            
            // Reset to play icon when audio ends
            audioElement.addEventListener('ended', function() {
                playReportButton.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                `;
            });
        } catch (playError) {
            console.warn('Audio play interrupted:', playError);
            // Restore the play button
            playReportButton.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                </svg>
            `;
        }
    } catch (error) {
        console.error('Error generating audio:', error);
        // Handle the error gracefully
        playReportButton.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
            </svg>
        `;
    }
}

function calculateRiskScore(percentages) {
    // Plus le score CD et LD est élevé, plus la tolérance au risque est grande
    return Math.round((parseFloat(percentages.CD) * 1.2 + parseFloat(percentages.LD) * 0.8) / 2);
}

function calculateTimeHorizon(percentages) {
    // Plus le score CG et LG est élevé, plus l'horizon est long terme
    return Math.round((parseFloat(percentages.CG) * 1.1 + parseFloat(percentages.LG) * 0.9) / 2);
}

function calculateDiversificationLevel(percentages) {
    // Combinaison de tous les quadrants avec pondération
    return Math.round(
        (parseFloat(percentages.CG) * 0.3 + 
        parseFloat(percentages.CD) * 0.3 + 
        parseFloat(percentages.LG) * 0.2 + 
        parseFloat(percentages.LD) * 0.2)
    );
}

function calculateMarketTiming(percentages) {
    // Équilibre entre réactivité (CD, LD) et patience (CG, LG)
    return Math.round(
        (parseFloat(percentages.CD) * 0.4 + 
        parseFloat(percentages.LD) * 0.4 - 
        parseFloat(percentages.CG) * 0.1 - 
        parseFloat(percentages.LG) * 0.1 + 50)
    );
}

function calculateFinancialStrengths(percentages, dominant, secondary) {
    const strengths = [];
    
    // Forces basées sur le quadrant dominant
    if (dominant === 'CD') {
        strengths.push("Excellente capacité à détecter les tendances émergentes et les opportunités d'investissement innovantes");
        strengths.push("Vision à long terme des marchés et des secteurs en croissance");
        strengths.push("Créativité dans l'élaboration de stratégies d'investissement non conventionnelles et avant-gardistes");
    } else if (dominant === 'CG') {
        strengths.push("Forte capacité d'analyse des données financières et des rapports d'entreprise");
        strengths.push("Approche rigoureuse et méthodique dans la sélection d'investissements");
        strengths.push("Évaluation factuelle et objective des opportunités et des risques");
    } else if (dominant === 'LD') {
        strengths.push("Intuition développée pour sentir les mouvements de marché et les opportunités");
        strengths.push("Sensibilité aux aspects éthiques et sociaux des investissements");
        strengths.push("Forte capacité à établir des relations professionnelles utiles pour l'investissement");
    } else if (dominant === 'LG') {
        strengths.push("Excellente organisation et discipline dans le suivi des investissements");
        strengths.push("Approche structurée et méthodique de la planification financière");
        strengths.push("Rigueur et constance dans l'application de vos stratégies d'investissement");
    }
    
    // Force supplémentaire basée sur le quadrant secondaire
    if (secondary === 'CD') {
        strengths.push("Capacité à innover et à repenser vos stratégies quand nécessaire");
    } else if (secondary === 'CG') {
        strengths.push("Bon équilibre entre analyse rationnelle et prise de décision");
    } else if (secondary === 'LD') {
        strengths.push("Sensibilité aux facteurs humains et émotionnels qui influencent les marchés");
    } else if (secondary === 'LG') {
        strengths.push("Bonne organisation et suivi méthodique de vos investissements");
    }
    
    return strengths;
}

function calculateFinancialWeaknesses(percentages, dominant, secondary) {
    const weaknesses = [];
    
    // Faiblesses basées sur les quadrants les moins développés
    const quadrants = Object.entries(percentages)
        .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
        .map(item => item[0]);
    
    const leastDeveloped = quadrants[0];
    
    if (leastDeveloped === 'CD') {
        weaknesses.push("Difficulté à anticiper les innovations disruptives et les tendances émergentes");
        weaknesses.push("Risque de rester trop conventionnel dans vos choix d'investissement");
    } else if (leastDeveloped === 'CG') {
        weaknesses.push("Possible manque de rigueur analytique dans l'évaluation des investissements");
        weaknesses.push("Tendance à sous-utiliser les données quantitatives dans vos décisions");
    } else if (leastDeveloped === 'LD') {
        weaknesses.push("Risque de négliger l'aspect humain et relationnel de l'investissement");
        weaknesses.push("Possible insensibilité aux facteurs émotionnels qui influencent les marchés");
    } else if (leastDeveloped === 'LG') {
        weaknesses.push("Manque potentiel d'organisation et de suivi systématique des investissements");
        weaknesses.push("Risque d'indiscipline dans l'application de vos stratégies à long terme");
    }
    
    // Faiblesses liées au quadrant dominant (excess potentials)
    if (dominant === 'CD') {
        weaknesses.push("Tendance à surestimer le potentiel des innovations et des nouvelles technologies");
    } else if (dominant === 'CG') {
        weaknesses.push("Risque de paralysie par l'analyse et difficulté à prendre des décisions rapides");
    } else if (dominant === 'LD') {
        weaknesses.push("Possible influence excessive des émotions dans vos décisions d'investissement");
    } else if (dominant === 'LG') {
        weaknesses.push("Risque d'être trop conservateur et de manquer des opportunités innovantes");
    }
    
    return weaknesses;
}

function generateActionSteps(dominant, secondary) {
    const actionSteps = [];
    
    // Étapes d'action basées sur le profil dominant
    if (dominant === 'CD') {
        actionSteps.push({
            title: "Équilibrer innovation et discipline",
            description: "Établissez un cadre structuré pour évaluer vos idées innovantes. Fixez des critères clairs avant d'investir dans des concepts émergents."
        });
        actionSteps.push({
            title: "Diversifier stratégiquement",
            description: "Répartissez vos investissements entre innovations (70%) et valeurs plus stables (30%) pour équilibrer risque et sécurité."
        });
    } else if (dominant === 'CG') {
        actionSteps.push({
            title: "Fixer des délais de décision",
            description: "Pour éviter la paralysie par l'analyse, établissez des délais maximums pour chaque phase d'analyse et de prise de décision."
        });
        actionSteps.push({
            title: "Intégrer des facteurs qualitatifs",
            description: "Complétez vos analyses quantitatives par l'évaluation de facteurs comme la qualité du management ou les tendances sectorielles."
        });
    } else if (dominant === 'LD') {
        actionSteps.push({
            title: "Structurer vos intuitions",
            description: "Créez un journal d'investissement pour documenter vos intuitions et vérifier leur précision dans le temps."
        });
        actionSteps.push({
            title: "Équilibrer émotion et analyse",
            description: "Pour chaque décision basée sur l'intuition, exigez-vous au moins trois points d'analyse objective avant d'investir."
        });
    } else if (dominant === 'LG') {
        actionSteps.push({
            title: "Explorer de nouvelles approches",
            description: "Consacrez 10% de votre portefeuille à des stratégies plus innovantes pour tester de nouvelles approches sans compromettre votre sécurité."
        });
        actionSteps.push({
            title: "Assouplir vos routines",
            description: "Revisitez vos critères d'investissement trimestriellement pour éviter une rigidité excessive dans votre approche."
        });
    }
    
    // Une étape universelle pour tous les profils
    actionSteps.push({
        title: "3. Renforcer votre intelligence financière",
        description: "Connectez-vous à notre coach financier IA, MIRA, ainsi que la plateforme MindWay pour développer vos compétences."
    });
    
    // Ajout d'une étape sur la mitigation des biais
    actionSteps.push({
        title: "Mitigation des biais cognitifs",
        description: "Mettez en place un processus de validation en trois étapes pour vos décisions importantes : 1) Identification du biais potentiel, 2) Recherche d'opinions contradictoires, 3) Délai de réflexion de 48h avant l'exécution finale pour réduire l'impact émotionnel de 40%."
    });
    
    return actionSteps;
}

function getProgressDegrees(percentage) {
    return percentage * 3.6;
}

function getScoreInterpretation(quadrant, score) {
    const interpretations = {
        CD: "Ce score reflète votre capacité à penser de manière créative et innovante dans vos décisions financières.",
        CG: "Ce niveau indique votre approche analytique et rationnelle dans l'évaluation des opportunités d'investissement.",
        LD: "Ce résultat montre votre sensibilité aux aspects émotionnels et relationnels dans la gestion financière.",
        LG: "Ce score représente votre capacité à organiser et structurer vos décisions d'investissement."
    };
    return interpretations[quadrant];
}

function getTraitLevel(score) {
    return Math.round(score * 1.2); 
}

function getQuadrantDescription(quadrant) {
    const descriptions = {
        CD: "Force Créative (CD)",
        CG: "Force Analytique (CG)",
        LD: "Force Relationnelle (LD)",
        LG: "Force Organisationnelle (LG)"
    };
    return descriptions[quadrant];
}

function getQuadrantInvestmentStyle(quadrant) {
    const styles = {
        CD: "Croissance et innovation",
        CG: "Valeur et qualité",
        LD: "Impact et valeurs",
        LG: "Revenu et préservation"
    };
    return styles[quadrant];
}

function getQuadrantInvestmentStyleDescription(quadrant) {
    const descriptions = {
        CD: "Vous recherchez des opportunités d'investissement dans des secteurs émergents et des technologies de rupture",
        CG: "Vous recherchez des actifs sous-évalués avec des fondamentaux solides et mesurables",
        LD: "Vous privilégiez les investissements alignés avec vos convictions et ayant un impact social positif",
        LG: "Vous recherchez des actifs générant des flux réguliers et prévisibles avec protection du capital"
    };
    return descriptions[quadrant];
}

function getQuadrantDecisionProcess(quadrant) {
    const processes = {
        CD: "Intuitif et visionnaire",
        CG: "Méthodique et rationnel",
        LD: "Intuitif et relationnel",
        LG: "Structuré et méthodique"
    };
    return processes[quadrant];
}

function getQuadrantDecisionProcessDescription(quadrant) {
    const descriptions = {
        CD: "Vous prenez des décisions basées sur une vision globale et une capacité à anticiper les tendances futures",
        CG: "Vous prenez vos décisions d'investissement après une analyse approfondie des données et une évaluation objective des options",
        LD: "Vos décisions d'investissement sont souvent guidées par vos valeurs, votre intuition et votre ressenti émotionnel",
        LG: "Vous suivez un processus de décision discipliné, rigoureux et systématique pour chaque investissement"
    };
    return descriptions[quadrant];
}

function getQuadrantCharacteristics(quadrant) {
    const characteristics = {
        CD: [
            "Forte capacité à identifier de nouvelles opportunités d'investissement et à anticiper les tendances futures",
            "Approche créative et innovante dans la résolution de problèmes financiers complexes",
            "Préférence pour les stratégies d'investissement non conventionnelles et avant-gardistes",
            "Grande capacité à identifier et exploiter les opportunités émergentes du marché"
        ],
        CG: [
            "Excellence dans l'analyse des données financières et la prise de décision rationnelle",
            "Approche méthodique et structurée de l'investissement",
            "Capacité à évaluer objectivement les opportunités et les risques",
            "Fort intérêt pour les aspects techniques et quantitatifs"
        ],
        LD: [
            "Forte capacité à comprendre les autres et à créer des liens",
            "Approche créative et innovante dans la résolution de problèmes relationnels",
            "Préférence pour les stratégies d'investissement qui mettent l'accent sur les relations humaines",
            "Grande capacité à identifier et exploiter les opportunités émergentes du marché"
        ],
        LG: [
            "Excellence dans l'organisation et la planification",
            "Approche méthodique et structurée de l'investissement",
            "Capacité à évaluer objectivement les opportunités d'investissement",
            "Fort intérêt pour les aspects techniques et quantitatifs"
        ]
    };
    return characteristics[quadrant];
}

function getQuadrantTraits(quadrant) {
    const traits = {
        CD: ["Créatif", "Innovant", "Visionnaire", "Synthétique"],
        CG: ["Analytique", "Méthodique", "Rationnel", "Logique"],
        LD: ["Émotif", "Empathique", "Créatif", "Flexible"],
        LG: ["Organisé", "Méthodique", "Rationnel", "Logique"]
    };
    return traits[quadrant];
}

function getQuadrantWellbeing(quadrant) {
    const wellbeings = {
        CD: "Satisfaction par l'innovation",
        CG: "Sécurité par l'analyse",
        LD: "Harmonie émotionnelle",
        LG: "Tranquillité par l'organisation"
    };
    return wellbeings[quadrant];
}

function getQuadrantWellbeingDescription(quadrant) {
    const descriptions = {
        CD: "Votre bien-être financier passe par la découverte constante de nouvelles approches et la stimulation intellectuelle",
        CG: "Vous trouvez votre équilibre dans la compréhension approfondie de vos finances et une approche factuelle",
        LD: "Votre épanouissement financier est lié à l'alignement de vos investissements avec vos convictions personnelles et relationnelles",
        LG: "Vous atteignez la sérénité financière grâce à des routines bien établies et une planification méthodique"
    };
    return descriptions[quadrant];
}

function getQuadrantTheme(quadrant) {
    const themes = {
        CD: "Technologies et innovation",
        CG: "Secteurs établis et fondamentaux",
        LD: "Investissement responsable",
        LG: "Stabilité et rendement"
    };
    return themes[quadrant];
}

function getQuadrantThemeDescription(quadrant) {
    const descriptions = {
        CD: "Vous êtes naturellement attiré par les secteurs émergents, les technologies de rupture et les modèles d'affaires innovants",
        CG: "Vous privilégiez les entreprises avec des modèles économiques éprouvés, une gouvernance solide et des données financières robustes",
        LD: "Vous recherchez des investissements qui conjuguent impact social positif et alignement avec vos valeurs personnelles",
        LG: "Vous êtes attiré par les secteurs traditionnels offrant des rendements prévisibles et une volatilité maîtrisée"
    };
    return descriptions[quadrant];
}

function getBiasesByProfile(percentages) {
    const sortedQuadrants = Object.entries(percentages)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
        .map(item => item[0]);
    
    const dominantQuadrant = sortedQuadrants[0];
    const secondaryQuadrant = sortedQuadrants[1];
    
    const biases = {
        CD: [
            {
                title: "Biais de surconfiance",
                desc: "Tendance à surestimer vos capacités d'analyse et de prédiction des marchés, pouvant mener à une prise de risque excessive.",
                impact: "Ce biais peut réduire votre rendement de 35% en vous exposant à des risques non nécessaires et en surestimant vos capacités de timing de marché."
            },
            {
                title: "Biais d'innovation",
                desc: "Attirance disproportionnée pour les investissements nouveaux ou disruptifs au détriment d'options plus éprouvées.",
                impact: "Impact de 40% sur la diversification de votre portefeuille, créant potentiellement une concentration excessive dans des secteurs émergentes à forte volatilité."
            }
        ],
        CG: [
            {
                title: "Paralysie par l'analyse",
                desc: "Tendance à trop analyser les situations, retardant la prise de décision et manquant parfois des opportunités.",
                impact: "Ce biais peut réduire vos performances de 28% en vous faisant manquer des fenêtres d'opportunité sur les marchés dynamiques."
            },
            {
                title: "Excès de confiance dans les données",
                desc: "Risque de négliger les facteurs qualitatifs ou intuitifs importants.",
                impact: "Impact de 32% sur la qualité de vos décisions, particulièrement dans des contextes d'incertitude où les données historiques ont une valeur prédictive limitée."
            }
        ],
        LD: [
            {
                title: "Biais émotionnel",
                desc: "Vos décisions peuvent être trop influencées par vos émotions ou vos relations, au détriment d'une analyse objective.",
                impact: "Ce biais peut affecter 45% de vos décisions d'investissement, menant potentiellement à des achats impulsifs ou des ventes précipitées basées sur la peur ou l'enthousiasme."
            },
            {
                title: "Biais de récence",
                desc: "Tendance à accorder trop d'importance aux événements récents ou marquants émotionnellement.",
                impact: "Impact de 38% sur votre vision à long terme, vous amenant à surréagir aux événements récents et à extrapoler les tendances à court terme."
            }
        ],
        LG: [
            {
                title: "Rigidité cognitive",
                desc: "Difficulté à s'adapter rapidement aux changements de situation ou à remettre en question vos méthodes établies.",
                impact: "Ce biais peut limiter de 30% votre capacité d'adaptation aux changements de marché, vous maintenant dans des stratégies potentiellement obsolètes."
            },
            {
                title: "Biais de conservatisme",
                desc: "Préférence excessive pour le maintien du statu quo et réticence à ajuster votre stratégie même face à de nouvelles informations.",
                impact: "Impact de 36% sur l'évolution de votre portefeuille, réduisant votre capacité à saisir de nouvelles opportunités ou à vous adapter à l'évolution des conditions de marché."
            }
        ]
    };
    
    let biasesHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">';
    
    biasesHTML += biases[dominantQuadrant].map(bias => 
        `<div class="bias-item">
            <div class="bias-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${getBiasIcon(bias.title)}
                </svg>
            </div>
            <h4 class="bias-title" data-impact="${bias.impact}" style="font-size: 0.95em; display: flex; align-items: center;">
                ${bias.title}
                <span class="info-icon" style="margin-left: 8px; cursor: pointer;" onclick="showBiasInfo('${bias.title}', '${bias.desc}', '${bias.impact}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                </span>
            </h4>
            <p class="bias-description" style="font-size: 0.85em; margin-bottom: 5px;">${bias.desc}</p>
            <p class="bias-impact">${bias.impact}</p>
        </div>`
    ).join('');
    
    biasesHTML += `<div class="bias-item">
        <div class="bias-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${getBiasIcon(biases[secondaryQuadrant][0].title)}
            </svg>
        </div>
        <h4 class="bias-title" data-impact="${biases[secondaryQuadrant][0].impact}" style="font-size: 0.95em; display: flex; align-items: center;">
            ${biases[secondaryQuadrant][0].title}
            <span class="info-icon" style="margin-left: 8px; cursor: pointer;" onclick="showBiasInfo('${biases[secondaryQuadrant][0].title}', '${biases[secondaryQuadrant][0].desc}', '${biases[secondaryQuadrant][0].impact}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                </svg>
            </span>
        </h4>
        <p class="bias-description" style="font-size: 0.85em; margin-bottom: 5px;">${biases[secondaryQuadrant][0].desc}</p>
        <p class="bias-impact">${biases[secondaryQuadrant][0].impact}</p>
    </div>`;
    
    biasesHTML += '</div>';
    
    return biasesHTML;
}

// New function to get appropriate icon for each bias
function getBiasIcon(biasTitle) {
    switch (biasTitle) {
        case "Biais de surconfiance":
            return `<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="var(--primary-color)"/>
                   <path d="M16 12l-4-4v3H8v2h4v3l4-4z" fill="var(--primary-color)"/>`;
        case "Biais d'innovation":
            return `<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" fill="var(--primary-color)"/>
                   <path d="M16 12l-4-4v3H8v2h4v3l4-4z" fill="var(--primary-color)"/>`;
        case "Paralysie par l'analyse":
            return `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H11V15H9V17ZM9 13H11V7H9V13Z" fill="var(--primary-color)"/>`;
        case "Excès de confiance dans les données":
            return `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="var(--primary-color)"/>`;
        case "Biais émotionnel":
            return `<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="var(--primary-color)"/>
                   <path d="M12 17l-4-4v3H8v2h4v3l4-4z" fill="var(--primary-color)"/>`;
        case "Biais de récence":
            return `<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="var(--primary-color)"/>
                   <path d="M12 17l-4-4v3H8v2h4v3l4-4z" fill="var(--primary-color)"/>`;
        case "Rigidité cognitive":
            return `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H11V15H9V17ZM9 13H11V7H9V13Z" fill="var(--primary-color)"/>`;
        case "Biais de conservatisme":
            return `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H11V15H9V17ZM9 13H11V7H9V13Z" fill="var(--primary-color)"/>`;
        default:
            return `<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="var(--primary-color)"/>
                   <path d="M16 12l-4-4v3H8v2h4v3l4-4z" fill="var(--primary-color)"/>`;
    }
}

// Add this new function to show bias info
function showBiasInfo(title, desc, impact) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'biasInfoModal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; padding: 25px;">
            <span class="close-modal">&times;</span>
            <h3 style="color: var(--primary-color); margin-top: 0;">${title}</h3>
            <div style="margin-top: 15px;">
                <p><strong>Description:</strong> ${desc}</p>
                <p style="margin-top: 15px;"><strong>Impact sur l'investissement:</strong> ${impact}</p>
                <div style="margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                    <h4 style="margin-top: 0; color: var(--primary-color);">Comment mitiger ce biais</h4>
                    <p>Développez une conscience active de ce biais et mettez en place des processus de décision qui incluent des vérifications et contre-vérifications systématiques.</p>
                    <p>Consultez régulièrement des opinions contradictoires et recherchez activement des informations qui pourraient contredire vos hypothèses initiales.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

function showProducts(category, quadrant) {
    const products = {
        CD: {
            actions: [
                "ARK Innovation ETF (ARKK) - Fonds axé sur les sociétés innovantes dans les technologies de rupture avec un historique de croissance solide. Performance historique de +45% sur 5 ans.",
                "Global X Robotics & AI ETF (BOTZ) - Exposition aux leaders mondiaux de la robotique et de l'intelligence artificielle. Diversification sur plus de 30 sociétés."
            ],
            obligations: [
                "iShares Convertible Bond ETF (ICVT) - Obligations convertibles d'entreprises technologiques offrant un potentiel de croissance avec protection du capital. Rendement moyen de 3.5%.",
                "VanEck Green Bond ETF (GRNB) - Portefeuille d'obligations vertes finançant des projets environnementaux. Note ESG AAA."
            ],
            fondsIndiciels: [
                "Invesco QQQ Trust (QQQ) - Réplication du Nasdaq-100, forte exposition tech. Frais de gestion réduits (0.20%).",
                "First Trust NASDAQ Clean Edge ETF - Focus sur les énergies propres et technologies vertes. Plus de 40 sociétés sélectionnées."
            ]
        },
        CG: {
            actions: [
                "Vanguard Dividend Appreciation ETF (VIG) - Sociétés ayant augmenté leurs dividendes pendant au moins 10 ans consécutifs. Rendement annuel moyen de 4%.",
                "ProShares S&P 500 Dividend Aristocrats (NOBL) - Entreprises du S&P 500 avec 25+ années d'augmentation des dividendes. Volatilité réduite."
            ],
            obligations: [
                "iShares Core U.S. Aggregate Bond ETF (AGG) - Large exposition au marché obligataire US. Note de crédit moyenne AA+.",
                "Vanguard Total Bond Market ETF (BND) - Diversification maximale sur les obligations investment grade. Frais de gestion de 0.035%."
            ],
            fondsIndiciels: [
                "Vanguard S&P 500 ETF (VOO) - Réplication parfaite du S&P 500. Frais de gestion parmi les plus bas du marché (0.03%).",
                "iShares Core S&P 500 ETF (IVV) - Exposition aux 500 plus grandes entreprises US. Liquidité exceptionnelle."
            ]
        },
        LD: {
            actions: [
                "iShares ESG Aware MSCI USA ETF (ESGU) - Entreprises américaines leaders en ESG. Score de durabilité 8.5/10.",
                "Vanguard ESG U.S. Stock ETF (ESGV) - Exclusion des secteurs controversés. Plus de 1400 sociétés sélectionnées."
            ],
            obligations: [
                "iShares Global Green Bond ETF - Obligations vertes internationales. Impact environnemental positif mesuré.",
                "SPDR Bloomberg SASB Corporate Bond ESG ETF - Obligations d'entreprises avec critères ESG stricts. Rating moyen A-."
            ],
            fondsIndiciels: [
                "iShares MSCI KLD 400 Social ETF (DSI) - Focus sur l'impact social positif. Historique de plus de 20 ans.",
                "Xtrackers S&P 500 ESG ETF (SNPE) - Version ESG du S&P 500. Réduction de 50% de l'empreinte carbone."
            ]
        },
        LG: {
            actions: [
                "Vanguard High Dividend Yield ETF (VYM) - Rendement du dividende supérieur au S&P 500. Plus de 400 actions sélectionnées avec un historique de dividendes stables.",
                "iShares Select Dividend ETF (DVY) - Focus sur les sociétés avec les dividendes les plus élevés et les plus stables du marché américain. Protection contre l'inflation."
            ],
            obligations: [
                "iShares Core U.S. Aggregate Bond ETF (AGG) - Portefeuille diversifié d'obligations gouvernementales et corporate investment grade. Duration moyenne de 6 ans.",
                "Schwab U.S. Aggregate Bond ETF (SCHZ) - Exposition large au marché obligataire US avec des frais parmi les plus bas (0.04%). Notation moyenne AA+."
            ],
            fondsIndiciels: [
                "iShares Core S&P 500 ETF (IVV) - Réplication fidèle du S&P 500 avec des frais de gestion minimaux. Volume d'échange quotidien important.",
                "Vanguard Value ETF (VTV) - Exposition aux grandes entreprises value américaines. Ratio cours/bénéfice inférieur au marché."
            ]
        }
    };
    
    const modal = document.getElementById('productsModal');
    const productsList = document.getElementById('productsList');
    
    productsList.innerHTML = `
        <div class="product-category">
            <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            ${products[quadrant][category].map(product => `
                <div class="product-item">
                    <strong>${product.split(' - ')[0]}</strong>
                    <p>${product.split(' - ')[1]}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.style.display = 'block';

    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function showQuadrantInfo(quadrant) {
    const quadrantInfo = {
        CD: {
            title: "Cortical Droit (Force Créative)",
            description: `Le Cortical Droit ou force créative C'est le domaine du « Pourquoi », centré sur la créativité, l'innovation et la vision globale. C'est la composante rationnelle de l'hémisphère droit, qui vous pousse à explorer de nouvelles idées et à remettre en question les approches traditionnelles en matière de finances.
            <br><br>L'investisseur CD cherche du sens, des tendances émergentes et remet en question les modèles classiques.`,
            traits: ["Créatif", "Innovant", "Visionnaire", "Synthétique"],
            characteristics: [
                "Forte capacité à identifier de nouvelles opportunités d'investissement et à anticiper les tendances futures",
                "Approche créative et innovante dans la résolution de problèmes financiers complexes",
                "Préférence pour les stratégies d'investissement non conventionnelles et avant-gardistes",
                "Grande capacité à identifier et exploiter les opportunités émergentes du marché"
            ],
            strengths: [
                "Excellente capacité d'analyse",
                "Approche méthodique et structurée",
                "Grande attention aux détails techniques"
            ],
            weaknesses: [
                "Risque de paralysie par l'analyse",
                "Tendance à négliger l'intuition",
                "Peut manquer d'agilité face aux changements rapides"
            ]
        },
        CG: {
            title: "Cortical Gauche (Force Analytique)",
            description: "C'est le domaine du « Comment », centré sur l'analyse, la logique et la précision. C'est la composante analytique de l'hémisphère gauche, qui vous pousse à analyser les données et à prendre des décisions basées sur les faits.",
            traits: ["Analytique", "Méthodique", "Rationnel", "Logique"],
            characteristics: [
                "Excellence dans l'analyse des données financières et la prise de décision rationnelle",
                "Approche méthodique et structurée de l'investissement",
                "Capacité à évaluer objectivement les opportunités et les risques",
                "Fort intérêt pour les aspects techniques et quantitatifs"
            ],
            strengths: [
                "Grande capacité d'analyse",
                "Rigueur dans l'évaluation",
                "Approche factuelle"
            ],
            weaknesses: [
                "Peut manquer de flexibilité",
                "Néglige parfois l'intuition",
                "Tendance à la suranalyse"
            ]
        },
        LD: {
            title: "Limbique Droit (Force Relationnelle)",
            description: "C'est le domaine du « Qui », centré sur les relations, l'empathie et la créativité. C'est la composante émotionnelle de l'hémisphère droit, qui vous pousse à comprendre les autres et à créer des liens.",
            traits: ["Émotif", "Empathique", "Créatif", "Flexible"],
            characteristics: [
                "Forte capacité à comprendre les autres et à créer des liens",
                "Approche créative et innovante dans la résolution de problèmes relationnels",
                "Préférence pour les stratégies d'investissement qui mettent l'accent sur les relations humaines",
                "Grande capacité à identifier et exploiter les opportunités émergentes du marché"
            ],
            strengths: [
                "Excellente capacité à comprendre les autres",
                "Approche créative et innovante",
                "Grande attention aux détails émotionnels"
            ],
            weaknesses: [
                "Risque de paralysie par l'analyse",
                "Tendance à négliger les données factuelles",
                "Peut manquer d'agilité face aux changements rapides"
            ]
        },
        LG: {
            title: "Limbique Gauche (Force Organisationnelle)",
            description: "C'est le domaine du « Quoi », centré sur l'organisation, la planification et la structure. C'est la composante logique de l'hémisphère gauche, qui vous pousse à organiser et à planifier les tâches.",
            traits: ["Organisé", "Méthodique", "Rationnel", "Logique"],
            characteristics: [
                "Excellence dans l'organisation et la planification",
                "Approche méthodique et structurée de l'investissement",
                "Capacité à évaluer objectivement les opportunités d'investissement",
                "Fort intérêt pour les aspects techniques et quantitatifs"
            ],
            strengths: [
                "Grande capacité d'analyse",
                "Rigueur dans l'évaluation",
                "Approche factuelle"
            ],
            weaknesses: [
                "Peut manquer de flexibilité",
                "Néglige parfois l'intuition",
                "Tendance à la suranalyse"
            ]
        }
    };
    
    const info = quadrantInfo[quadrant];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quadrantInfoModal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content quadrant-info-modal">
            <span class="close-modal">&times;</span>
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="/LOGOMIND.png" alt="Mind Logo" style="height: 50px;">
            </div>
            <h3>${info.title}</h3>
            <div class="quadrant-info-content">
                <p>${info.description}</p>
                
                <h4>Traits dominants</h4>
                <div class="quadrant-traits">
                    ${info.traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
                </div>
                
                <h4>Caractéristiques principales</h4>
                <ul class="compact-list" style="font-size: 0.9em; margin-top: 5px;">
                    ${info.characteristics.map(char => `<li>${char}</li>`).join('')}
                </ul>
                
                <h4>Style d'investissement</h4>
                <p><strong>Forces :</strong></p>
                <ul class="compact-list" style="font-size: 0.9em; margin-top: 5px;">
                    ${info.strengths.map(str => `<li>${str}</li>`).join('')}
                </ul>
                <p><strong>Points d'attention :</strong></p>
                <ul class="compact-list" style="font-size: 0.9em; margin-top: 5px;">
                    ${info.weaknesses.map(weak => `<li>${weak}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

function toggleChat() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.classList.toggle('show-chat');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    chatMessages.innerHTML += `
        <div class="message user-message">${message}</div>
    `;
    
    userInput.value = '';
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const newMessage = {
        role: "user",
        content: message,
    };
    conversationHistory.push(newMessage);
    
    conversationHistory = conversationHistory.slice(-10);
    
    chatMessages.innerHTML += `
        <div class="message bot-message" id="typingIndicator">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Utiliser une fonction d'IA générique au lieu de websim
        const responseText = await generateAIResponse(conversationHistory);
        
        document.getElementById('typingIndicator').remove();
        
        chatMessages.innerHTML += `
            <div class="message bot-message">${responseText}</div>
        `;
        
        conversationHistory.push({
            role: "assistant",
            content: responseText
        });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        document.getElementById('typingIndicator').remove();
        
        chatMessages.innerHTML += `
            <div class="message bot-message">Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.</div>
        `;
        
        console.error('Error getting AI response:', error);
    }
}

// Fonction générique pour simuler une réponse IA
async function generateAIResponse(history) {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lastMessage = history[history.length - 1].content;
    
    // Réponses prédéfinies basées sur des mots-clés
    if (lastMessage.toLowerCase().includes("profil")) {
        return "Votre profil MindScore est basé sur les 4 quadrants cérébraux qui influencent vos décisions financières. Chaque quadrant représente un style cognitif différent avec ses forces et ses points d'attention.";
    } else if (lastMessage.toLowerCase().includes("quadrant")) {
        return "Les 4 quadrants sont: Cortical Gauche (analytique), Cortical Droit (visionnaire), Limbique Gauche (structuré) et Limbique Droit (relationnel). Votre profil montre une dominance particulière qui influence votre approche d'investissement.";
    } else if (lastMessage.toLowerCase().includes("investir") || lastMessage.toLowerCase().includes("investissement")) {
        return "Vos décisions d'investissement sont influencées par votre profil cognitif. Une meilleure connaissance de votre style dominant vous permet d'optimiser vos stratégies et de mitiger vos biais potentiels.";
    } else {
        return "Je suis votre assistant MindScore, spécialisé dans l'analyse des profils cognitifs financiers. N'hésitez pas à me poser des questions sur votre profil, les quadrants cérébraux ou vos recommandations personnalisées.";
    }
}

function restartTest() {
    currentQuestion = 0;
    answers = new Array(questions.length).fill([]);
    conversationHistory = [];
    document.getElementById('app').innerHTML = `
        <div id="intro-page" class="intro-container">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="/LOGOMIND.png" alt="Mind Logo" style="height: 80px; margin-bottom: 10px;">
            </div>
            <h1>Découvrez votre profil financier avec le MindScore</h1>
            
            <p>Le MindScore Financier est un outil psychométrique fondé sur les avancées en neurosciences cognitives et en finance comportementale, conçu pour analyser votre manière d'aborder l'investissement, l'épargne et la gestion de votre patrimoine.</p>
            
            <p>Le test identifie votre style financier dominant à partir de <strong style="color: var(--primary-color);">4 quadrants cérébraux</strong>, et génère jusqu'à <strong style="color: var(--primary-color);">64 combinaisons</strong> personnalisées pour refléter la complexité de votre profil d'investisseur.</p>
            
            <h2 style="color: var(--primary-color);">Les 4 principaux quadrants financiers</h2>
            
            <div class="styles-grid">
                <div class="style-card">
                    <h3 style="font-size: 1.1em;">Investisseur Analytique (Cortical Gauche)</h3>
                    <p>Rigueur, précision, rationalité. Une approche méthodique basée sur les données et l'analyse factuelle des opportunités.</p>
                </div>
                
                <div class="style-card">
                    <h3 style="font-size: 1.1em;">Investisseur Visionnaire (Cortical Droit)</h3>
                    <p>Créativité, innovation, anticipation. Une vision avant-gardiste des marchés et une capacité à repérer les tendances émergentes.</p>
                </div>
                
                <div class="style-card">
                    <h3 style="font-size: 1.1em;">Investisseur Structuré (Limbique Gauche)</h3>
                    <p>Organisation, stabilité, discipline. Une priorité donnée à la sécurité, à la planification et à l'investissement méthodique.</p>
                </div>
                
                <div class="style-card">
                    <h3 style="font-size: 1.1em;">Investisseur Relationnel (Limbique Droit)</h3>
                    <p>Intuition, valeurs, éthique. Un fort besoin d'alignement entre vos investissements et vos convictions personnelles.</p>
                </div>
            </div>
            
            <div class="methodology" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; margin: 30px 0; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3>Méthodologie</h3>
                <ul>
                    <li>Le test comporte 25 questions ciblées pour la version Fast </li>
                    <li><strong style="color: var(--primary-color);">À chaque question, vous sélectionnez les traits qui vous caractérisent le mieux, 3 maximum.</strong></li>
                    <li>Le croisement des réponses permet de cartographier votre profil d'investisseur.</li>
                    <li>Vous recevrez des recommandations personnalisées adaptées à votre style dominant.</li>
                </ul>
            </div>
            
            <button class="start-button" onclick="startTest()">Commencer le test</button>
        </div>
        
        <div id="test-page" style="display: none;">
            <div class="main-header">
                <img src="/LOGOMIND.png" alt="Mind Logo" style="height: 80px; margin-bottom: 15px;">
                <h1>MindScore</h1>
                <p>Découvrez votre profil cognitif et obtenez des recommandations personnalisées</p>
            </div>
            
            <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            
            <div class="question-container">
                <h2>Question <span id="questionNumber">1</span>/25</h2>
                <p id="questionText"></p>
                <button id="playQuestionAudio" class="audio-question-button" onclick="playQuestionAudio()">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
                    </svg>
                </button>
                <audio id="questionAudio" style="display: none;"></audio>
                <div class="options" id="options"></div>
            </div>

            <div class="navigation">
                <button id="prevBtn" onclick="previousQuestion()" disabled>Précédent</button>
                <button id="nextBtn" onclick="nextQuestion()">Suivant</button>
            </div>
            
            <div class="assistant-container">
                <div class="assistant-button" onclick="toggleChat()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17Z" fill="var(--primary-color)"/>
                    </svg>
                </div>
                <div class="chat-container" id="chatContainer">
                    <div class="chat-header">Assistant MindScore</div>
                    <div class="chat-messages" id="chatMessages">
                        <div class="message bot-message">Bonjour ! Je suis votre assistant MindScore. Comment puis-je vous aider aujourd'hui ?</div>
                    </div>
                    <div class="chat-input">
                        <input type="text" id="userInput" placeholder="Tapez votre message..." onkeypress="handleKeyPress(event)">
                        <button onclick="sendMessage()">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.707 7.293L1.707 0.293C1.434 0.156 1.118 0.138 0.833 0.243C0.548 0.348 0.320 0.565 0.2 0.85C0.080 1.135 0.079 1.458 0.198 1.744C0.316 2.030 0.543 2.249 0.827 2.356L10.587 6L0.827 9.644C0.543 9.751 0.316 9.970 0.198 10.256C0.079 10.542 0.080 10.865 0.2 11.15C0.320 11.435 0.548 11.652 0.833 11.757C1.118 11.862 1.434 11.844 1.707 11.707L15.707 4.707C15.937 4.592 16.121 4.404 16.232 4.173C16.343 3.941 16.374 3.678 16.321 3.427C16.267 3.175 16.131 2.949 15.935 2.786C15.739 2.623 15.494 2.532 15.24 2.529C15.395 2.526 15.548 2.491 15.688 2.426C15.827 2.362 15.95 2.270 16.045 2.158C16.141 2.045 16.209 1.914 16.244 1.773C16.279 1.631 16.281 1.484 16.249 1.341C16.217 1.199 16.152 1.066 16.059 0.951C15.966 0.837 15.847 0.743 15.711 0.675C15.574 0.608 15.423 0.57 15.271 0.564C15.119 0.558 14.966 0.585 14.824 0.641L14.707 0.707L15.707 7.293Z" fill="white"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        document.getElementById('intro-page').style.display = 'block';
        document.getElementById('test-page').style.display = 'none';
    }, 100);
}

function startTest() {
    document.getElementById('intro-page').style.display = 'none';
    document.getElementById('test-page').style.display = 'block';
    updateQuestion();
}

updateQuestion();

// Rendre la fonction disponible globalement
window.demarrerPaiement = async function demarrerPaiement() {
  const lastName  = document.getElementById('lastName').value;
  const firstName = document.getElementById('firstName').value;
  const email     = document.getElementById('email').value;
  if (!lastName || !firstName || !email) {
    return alert('Merci de remplir tous les champs !');
  }

  // Récupérer l’IP
  let ip = '';
  try {
    const resp = await fetch('https://api.ipify.org?format=json');
    ip = (await resp.json()).ip;
  } catch (e) {
    console.warn('IP indisponible');
  }

  // Stockage temporaire
  sessionStorage.setItem('lastName', lastName);
  sessionStorage.setItem('firstName', firstName);
  sessionStorage.setItem('email', email);
  sessionStorage.setItem('ip', ip);

  // Initialisation Stripe
  const stripe = Stripe('pk_test_51HpFicBzXQ043S59rhTdia9NC4Lm0cdPOPzqF5BO0YJ8n3GtdruxwbbObrgpeqa25JD73H8cfgTQFq4Tibs3nP7S000Ky2FHPA');

  try {
    // Création de la session Checkout via ton backend
    const response = await fetch('http://localhost:4242/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName, firstName, email, ip })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur serveur');
    }

    const { id: sessionId } = await response.json();

    // Redirection vers Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      alert(result.error.message);
    }
  } catch (err) {
    alert('Erreur lors du paiement : ' + err.message);
  }
};




