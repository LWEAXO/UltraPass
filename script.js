    document.addEventListener('DOMContentLoaded', function() {
      const passwordEl = document.getElementById('password');
      const copyBtn = document.getElementById('copy-btn');
      const generateBtn = document.getElementById('generate');
      const saveBtn = document.getElementById('save');
      const lengthEl = document.getElementById('length');
      const lengthValueEl = document.getElementById('length-value');
      const uppercaseEl = document.getElementById('uppercase');
      const lowercaseEl = document.getElementById('lowercase');
      const numbersEl = document.getElementById('numbers');
      const symbolsEl = document.getElementById('symbols');
      const excludeSimilarEl = document.getElementById('exclude-similar');
      const strengthBarEl = document.querySelector('.strength-bar');
      const strengthTextEl = document.getElementById('strength-text');
      const entropyEl = document.getElementById('entropy');
      const historyListEl = document.getElementById('history-list');
      const clearHistoryBtn = document.getElementById('clear-history');
      const themeSwitcherEl = document.getElementById('theme-switcher');
      const typeBtns = document.querySelectorAll('.type-btn');
      
      let passwordType = 'random';
      
      const charSets = {
        uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
        lowercase: 'abcdefghijkmnopqrstuvwxyz',
        numbers: '23456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        similar: '1lLiI0oO',
        syllables: ['ba', 'de', 'ki', 'lo', 'mu', 'sa', 'ta', 've', 'zo'],
        memorableWords: ['dragon', 'shield', 'planet', 'sunset', 'forest', 'castle', 'river', 'mountain', 'ocean']
      };
      
      const strengthLevels = [
        { min: 0, max: 28, text: "Çok Zayıf", color: "#ff4757", class: "strength-weak" },
        { min: 28, max: 36, text: "Zayıf", color: "#ff6348", class: "strength-weak" },
        { min: 36, max: 60, text: "Orta", color: "#ffa502", class: "strength-medium" },
        { min: 60, max: 90, text: "Güçlü", color: "#2ed573", class: "strength-strong" },
        { min: 90, max: Infinity, text: "Çok Güçlü", color: "#1dd1a1", class: "strength-strong" }
      ];
      
      typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          typeBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          passwordType = this.dataset.type;
          generatePassword();
        });
      });

      loadHistory();
      updateLengthValue();
      generatePassword();
      
      lengthEl.addEventListener('input', updateLengthValue);
      generateBtn.addEventListener('click', generatePassword);
      copyBtn.addEventListener('click', copyPassword);
      saveBtn.addEventListener('click', savePassword);
      clearHistoryBtn.addEventListener('click', clearHistory);
      themeSwitcherEl.addEventListener('click', toggleTheme);
      
      [uppercaseEl, lowercaseEl, numbersEl, symbolsEl, excludeSimilarEl].forEach(el => {
        el.addEventListener('change', generatePassword);
      });
      
      function updateLengthValue() {
        lengthValueEl.textContent = lengthEl.value;
        generatePassword();
      }
      
      function generatePassword() {
        const length = parseInt(lengthEl.value);
        
        switch(passwordType) {
          case 'random':
            passwordEl.value = generateRandomPassword(length);
            break;
          case 'pronounceable':
            passwordEl.value = generatePronounceablePassword(length);
            break;
          case 'memorable':
            passwordEl.value = generateMemorablePassword(length);
            break;
          case 'pin':
            passwordEl.value = generatePinCode(length);
            break;
          default:
            passwordEl.value = generateRandomPassword(length);
        }
        
        updatePasswordStrength(passwordEl.value);
      }
      
      function generateRandomPassword(length) {
        const includeUppercase = uppercaseEl.checked;
        const includeLowercase = lowercaseEl.checked;
        const includeNumbers = numbersEl.checked;
        const includeSymbols = symbolsEl.checked;
        const excludeSimilar = excludeSimilarEl.checked;
        
        let charset = '';
        if (includeUppercase) charset += charSets.uppercase;
        if (includeLowercase) charset += charSets.lowercase;
        if (includeNumbers) charset += charSets.numbers;
        if (includeSymbols) charset += charSets.symbols;
        
        if (excludeSimilar) {
          const similarChars = charSets.similar.split('');
          similarChars.forEach(char => {
            charset = charset.replace(new RegExp(char, 'g'), '');
          });
        }
        
        if (!charset) {
          return 'En az bir seçenek işaretleyin';
        }
        
        let password = '';
        const crypto = window.crypto || window.msCrypto;
        const values = new Uint32Array(length);
        
        if (crypto && crypto.getRandomValues) {
          crypto.getRandomValues(values);
          for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
          }
        } else {
          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
          }
        }
        
        return password;
      }
      
      function generatePronounceablePassword(length) {
        let password = '';
        const syllableCount = Math.ceil(length / 2);
        
        for (let i = 0; i < syllableCount; i++) {
          const randomIndex = Math.floor(Math.random() * charSets.syllables.length);
          password += charSets.syllables[randomIndex];
        }
        
        password = password.charAt(0).toUpperCase() + password.slice(1);
        
        if (numbersEl.checked && password.length < length) {
          password += Math.floor(Math.random() * 10);
        }
        
        if (symbolsEl.checked && password.length < length) {
          const symbols = charSets.symbols.replace(/[^\w\s]/g, '');
          password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        }
        
        return password.slice(0, length);
      }
      
      function generateMemorablePassword(length) {
        const wordCount = Math.min(Math.floor(length / 6) + 1, 4);
        let password = '';
        
        for (let i = 0; i < wordCount; i++) {
          const randomIndex = Math.floor(Math.random() * charSets.memorableWords.length);
          password += charSets.memorableWords[randomIndex];
          
          if (i < wordCount - 1) {
            if (numbersEl.checked) {
              password += Math.floor(Math.random() * 10);
            } else if (symbolsEl.checked) {
              password += '-';
            } else {
              password += ' ';
            }
          }
        }
        
        password = password.split(/[\s-]/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(numbersEl.checked ? '' : (symbolsEl.checked ? '-' : ' '));
        
        return password.slice(0, length);
      }
      
      function generatePinCode(length) {
        let pin = '';
        for (let i = 0; i < length; i++) {
          pin += Math.floor(Math.random() * 10);
        }
        return pin;
      }
      
      function updatePasswordStrength(password) {
        if (!password || password === 'En az bir seçenek işaretleyin') {
          strengthBarEl.style.width = '0%';
          strengthTextEl.textContent = 'Şifre Gücü';
          entropyEl.textContent = '0 bit entropi';
          return;
        }
        
        const charsetSize = getCharsetSize();
        const entropy = Math.log2(charsetSize) * password.length;
        entropyEl.textContent = `${Math.round(entropy)} bit entropi`;
        
        const strength = strengthLevels.find(level => 
          entropy >= level.min && entropy < level.max
        ) || strengthLevels[0];
        
        const percentage = Math.min(100, (entropy / strengthLevels[strengthLevels.length - 1].min) * 100);
        strengthBarEl.style.width = `${percentage}%`;
        strengthTextEl.textContent = strength.text;
        strengthTextEl.style.color = strength.color;
        
        return strength;
      }
      
      function getCharsetSize() {
        let size = 0;
        if (uppercaseEl.checked) size += charSets.uppercase.length;
        if (lowercaseEl.checked) size += charSets.lowercase.length;
        if (numbersEl.checked) size += charSets.numbers.length;
        if (symbolsEl.checked) size += charSets.symbols.length;
        return size;
      }
      
      function copyPassword() {
        if (!passwordEl.value || passwordEl.value === 'En az bir seçenek işaretleyin') return;
        
        passwordEl.select();
        document.execCommand('copy');
        
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.backgroundColor = '#00b894';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalIcon;
          copyBtn.style.backgroundColor = '';
        }, 2000);
      }
      
      function savePassword() {
        if (!passwordEl.value || passwordEl.value === 'En az bir seçenek işaretleyin') return;
        
        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        
        const strength = updatePasswordStrength(passwordEl.value);
        
        history.unshift({
          password: passwordEl.value,
          date: new Date().toLocaleString(),
          strength: strength.text,
          strengthClass: strength.class,
          type: passwordType
        });
        
        if (history.length > 15) {
          history = history.slice(0, 15);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        
        loadHistory();
        
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Kaydedildi!';
        saveBtn.style.backgroundColor = '#00b894';
        
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.style.backgroundColor = '';
        }, 2000);
      }
      
      function loadHistory() {
        const history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        historyListEl.innerHTML = '';
        
        if (history.length === 0) {
          historyListEl.innerHTML = '<li style="text-align: center; color: var(--text-secondary);">Henüz kayıtlı şifre yok</li>';
          return;
        }
        
        history.forEach((item, index) => {
          const li = document.createElement('li');
          
          const passwordSpan = document.createElement('span');
          passwordSpan.className = 'history-password';
          passwordSpan.textContent = item.password;
          
          const infoDiv = document.createElement('div');
          infoDiv.className = 'history-info';
          
          const dateSpan = document.createElement('span');
          dateSpan.className = 'history-date';
          dateSpan.textContent = item.date;
          
          const strengthSpan = document.createElement('span');
          strengthSpan.className = `history-strength ${item.strengthClass}`;
          strengthSpan.textContent = item.strength;
          
          const typeSpan = document.createElement('span');
          typeSpan.className = 'history-type';
          typeSpan.textContent = item.type === 'random' ? 'Rastgele' : 
                                item.type === 'pronounceable' ? 'Telaffuz' :
                                item.type === 'memorable' ? 'Akılda Kalıcı' : 'PIN';
          typeSpan.style.fontSize = '0.7rem';
          typeSpan.style.padding = '2px 6px';
          typeSpan.style.borderRadius = '10px';
          typeSpan.style.backgroundColor = 'rgba(124, 77, 255, 0.1)';
          typeSpan.style.color = 'var(--primary)';
          
          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'history-actions';
          
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-history-btn';
          copyBtn.innerHTML = '<i class="far fa-copy"></i>';
          copyBtn.title = 'Kopyala';
          copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(item.password);
            
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.color = '#00b894';
            
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="far fa-copy"></i>';
              copyBtn.style.color = '';
            }, 1000);
          });
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.innerHTML = '<i class="far fa-trash-alt"></i>';
          deleteBtn.title = 'Sil';
          deleteBtn.dataset.index = index;
          deleteBtn.addEventListener('click', deletePassword);
          
          actionsDiv.appendChild(copyBtn);
          actionsDiv.appendChild(deleteBtn);
          
          infoDiv.appendChild(typeSpan);
          infoDiv.appendChild(dateSpan);
          infoDiv.appendChild(strengthSpan);
          infoDiv.appendChild(actionsDiv);
          
          li.appendChild(passwordSpan);
          li.appendChild(infoDiv);
          
          li.addEventListener('click', () => {
            passwordEl.value = item.password;
            updatePasswordStrength(item.password);
            
            document.querySelectorAll('#history-list li').forEach(li => {
              li.style.backgroundColor = '';
            });
            li.style.backgroundColor = 'rgba(124, 77, 255, 0.1)';
          });
          
          historyListEl.appendChild(li);
        });
      }
      
      function deletePassword(e) {
        e.stopPropagation();
        const index = e.target.closest('button').dataset.index;
        
        let history = JSON.parse(localStorage.getItem('passwordHistory') || '[]');
        history.splice(index, 1);
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        
        loadHistory();
        
        const originalIcon = e.target.closest('button').innerHTML;
        e.target.closest('button').innerHTML = '<i class="fas fa-check"></i>';
        e.target.closest('button').style.color = '#00b894';
        
        setTimeout(() => {
          e.target.closest('button').innerHTML = originalIcon;
          e.target.closest('button').style.color = '';
        }, 1000);
      }
      
      function clearHistory() {
        if (confirm('Tüm şifre geçmişini silmek istediğinize emin misiniz?')) {
          localStorage.removeItem('passwordHistory');
          loadHistory();
          
          const originalText = clearHistoryBtn.innerHTML;
          clearHistoryBtn.innerHTML = '<i class="fas fa-check"></i> Temizlendi!';
          clearHistoryBtn.style.color = '#00b894';
          
          setTimeout(() => {
            clearHistoryBtn.innerHTML = originalText;
            clearHistoryBtn.style.color = '';
          }, 2000);
        }
      }
      
      function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeSwitcherEl.style.transform = 'scale(1.1) rotate(180deg)';
        setTimeout(() => {
          themeSwitcherEl.style.transform = '';
        }, 300);
      }
      
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });