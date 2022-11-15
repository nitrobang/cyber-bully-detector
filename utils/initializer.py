import nltk
from nltk.stem import PorterStemmer
ps = PorterStemmer()


from keras.models import model_from_json
json_file = open('Bullying Model/model.json', 'r') #load model
loaded_model_json = json_file.read()
json_file.close()
loaded_model = model_from_json(loaded_model_json)
loaded_model.load_weights("Bullying Model/model.h5") #load weights 
loaded_model.compile(loss='binary_crossentropy',optimizer='adam',metrics=['accuracy']) 



import json
from keras_preprocessing.text import tokenizer_from_json
with open('Bullying Model/tokenizer.json') as f:
    data = json.load(f)
    tokenizer = tokenizer_from_json(data) #load tokenizer


stop_words = {'whom', 'few', 'will', "doesn't", 'if', 'weren', 'isn', 'in', 'that', 'mightn', 'when', 'had', 'd', 'its', 'own', 'at', 'against', "couldn't", 'just', 'a', 'with', 'once', 'hadn', 'does', 'of', 'me', 'and', 'wasn', "it's", "haven't", "hadn't", 'do', 'each', "shouldn't", 'but', 'his', 'her', 'below', 'most', 'as', 'be', 'other', 'theirs', 'having', 'then', 'to', 'over', 'did', 'should', 'off', 'the', 'them', 'these', 'himself', 'have', 'both', 'o', "she's", 'up', 'herself', 'out', 'only', "you're", 'very', 'through', 'after', 'some', 're', "hasn't", 'don', 'nor', 'has', 'not', 'can', "that'll", "aren't", "mustn't", 'again', 'aren', 'y', 'is', 'down', 'any', 'themselves', 'on', 'where', 'their', 'we', 'yours', 'all', 'wouldn', 'didn', 'further', 's', 'there', 'my', 'into', 'same', "needn't", 'what', 'those', 'because', 't', 'doesn', "weren't", 'than', "should've", 'your', 'our', 'ain', "mightn't", 'from', 'shan', 'hasn', 'before', 'itself', 'him', 'an', 'myself', 'for', "don't", 'hers', 'being', 'couldn', 'here', 'ours', 'was', 'how', 'which', 'are', 've', 'above', "wouldn't", 'during', "you'd", "you'll", 'until', 'no', 'yourself', 'm', 'while', "didn't", "shan't", 'so', "you've", 'll', 'it', 'she', 'needn', 'about', 'yourselves', 'shouldn', 'won', 'he', 'now', 'between', 'been', 'this', 'doing', 'more', 'they', 'by', "isn't", 'such', 'you', 'am', 'ma', "won't", 'ourselves', 'who', 'or', "wasn't", 'were', 'why', 'haven', 'too', 'under', 'mustn', 'i'}